/**
 * GET /api/fund/[code]/history
 *
 * 获取单只基金历史净值
 * 数据源：api.fund.eastmoney.com/f10/lsjz
 *
 * 路由参数：
 *   code  string  required  基金代码（6 位）
 *
 * 查询参数：
 *   pageSize    number  optional  每页条数，默认 30
 *   pageIndex   number  optional  页码，默认 1
 *
 * 缓存策略：Cache-Control: public, max-age=3600
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { success, error, sendJson } from '../../_lib/response';
import { fetchJson, FetchError } from '../../_lib/fetcher';

// ─── 上游数据格式 ────────────────────────────────────────────────────
// 东方财富 lsjz 接口返回 JSON：
// {
//   "Data": {
//     "LSJZList": [
//       {"FSRQ":"2025-07-04","DWJZ":"2.3500","LJJZ":"3.1200","JZZZL":"0.51"}
//     ],
//     "pageIndex": 1,
//     "pageSize": 30,
//     "TotalCount": 365
//   },
//   "ErrCode": 0,
//   "ErrMsg": null
// }

interface RawHistoryItem {
  FSRQ: string;    // 净值日期
  DWJZ: string;    // 单位净值
  LJJZ: string;    // 累计净值
  JZZZL: string;   // 净值增长率 (%)
}

interface RawLSJZData {
  Data: {
    LSJZList: RawHistoryItem[];
    pageIndex: number;
    pageSize: number;
    TotalCount: number;
  };
  ErrCode: number;
  ErrMsg: string | null;
}

// ─── 输出格式 ────────────────────────────────────────────────────────

interface HistoryItem {
  date: string;
  nav: number;
  accNav: number;
  change: number;
}

interface HistoryData {
  code: string;
  name: string;
  total: number;
  pageIndex: number;
  pageSize: number;
  items: HistoryItem[];
}

// ─── 处理函数 ────────────────────────────────────────────────────────

async function fetchFundName(code: string): Promise<string> {
  // 从搜索源获取基金名称（轻量查询）
  const url = `https://fundgz.1234567.com.cn/js/${code}.js`;
  try {
    const raw = await fetchJson<{ name: string }>(url);
    return raw.name;
  } catch {
    return `基金${code}`;
  }
}

// ─── 入口 ────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, error(1001, '仅支持 GET 请求'));
  }

  const code = req.query.code as string;
  if (!code || !/^\d{6}$/.test(code)) {
    return sendJson(res, error(1001, '路由参数 code 需为 6 位基金代码'));
  }

  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize as string) || 30, 1), 100);
  const pageIndex = Math.max(parseInt(req.query.pageIndex as string) || 1, 1);

  try {
    // 构造东方财富接口 URL
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5); // 默认查 5 年

    const url =
      `https://api.fund.eastmoney.com/f10/lsjz?callback=jQuery&fundCode=${code}` +
      `&pageIndex=${pageIndex}&pageSize=${pageSize}&startDate=${formatDate(startDate)}` +
      `&endDate=${formatDate(endDate)}&_=${Date.now()}`;

    const raw = await fetchJson<RawLSJZData>(url);

    if (raw.ErrCode !== 0) {
      return sendJson(res, error(1003, `上游返回错误: ${raw.ErrMsg || `ErrCode=${raw.ErrCode}`}`));
    }

    const lsjzData = raw.Data;
    const items: HistoryItem[] = lsjzData.LSJZList.map((item: RawHistoryItem) => ({
      date: item.FSRQ,
      nav: parseFloat(item.DWJZ) || 0,
      accNav: parseFloat(item.LJJZ) || 0,
      change: parseFloat(item.JZZZL) || 0,
    }));

    // 只第一次请求时获取基金名称（用于第一页）
    let name = `基金${code}`;
    if (pageIndex === 1 || items.length > 0) {
      name = await fetchFundName(code);
    }

    const data: HistoryData = {
      code,
      name,
      total: lsjzData.TotalCount,
      pageIndex: lsjzData.pageIndex,
      pageSize: lsjzData.pageSize,
      items,
    };

    return sendJson(res, success(data), 'public, max-age=3600');
  } catch (err: unknown) {
    if (err instanceof FetchError) {
      return sendJson(res, error(err.code, err.message));
    }
    console.error('[history] 未预期错误:', err);
    return sendJson(res, error(1003, `数据请求失败: ${err instanceof Error ? err.message : String(err)}`));
  }
}

// ─── 工具 ────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
