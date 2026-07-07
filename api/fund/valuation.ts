/**
 * GET /api/fund/valuation
 *
 * 批量获取基金实时估值
 * 数据源：fundgz.1234567.com.cn（JSONP 格式）
 *
 * 参数：
 *   codes  string  required  基金代码，逗号分隔，如 "110022,005827"
 *
 * 缓存策略：Cache-Control: public, max-age=60
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { success, error, sendJson } from '../_lib/response';
import { fetchJson, FetchError } from '../_lib/fetcher';

// ─── 上游数据格式 ────────────────────────────────────────────────────
// fundgz 返回 JSONP：
//   jsonpgz({"fundcode":"110022","name":"易方达消费行业股票",
//     "jzrq":"2025-07-07","dwjz":"2.3500","gsz":"2.3620",
//     "gztime":"2025-07-07 13:45","gszzl":"0.51","gzds":"0.0120"})

interface RawValuation {
  fundcode: string;   // 基金代码
  name: string;       // 基金名称
  jzrq: string;       // 净值日期
  dwjz: string;       // 单位净值
  gsz: string;        // 估算净值
  gztime: string;     // 估值时间
  gszzl: string;      // 估算涨跌幅 (%)
  gzds: string;       // 估算涨跌额
}

// ─── 输出格式 ────────────────────────────────────────────────────────

interface ValuationItem {
  code: string;
  name: string;
  nav: number;
  valuation: number;
  change: number;
  changeAmount: number;
  updateTime: string;
}

// ─── 处理函数 ────────────────────────────────────────────────────────

async function fetchSingleValuation(code: string): Promise<ValuationItem | null> {
  const url = `https://fundgz.1234567.com.cn/js/${code}.js`;
  try {
    const raw = await fetchJson<RawValuation>(url);
    return {
      code: raw.fundcode,
      name: raw.name,
      nav: parseFloat(raw.dwjz),
      valuation: parseFloat(raw.gsz),
      change: parseFloat(raw.gszzl),
      changeAmount: parseFloat(raw.gzds),
      updateTime: raw.gztime,
    };
  } catch (err: unknown) {
    // 单只失败不影响其他
    if (err instanceof FetchError) {
      console.error(`[valuation] 查询 ${code} 失败: ${err.message}`);
    }
    return null;
  }
}

// ─── 入口 ────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 GET
  if (req.method !== 'GET') {
    return sendJson(res, error(1001, '仅支持 GET 请求'));
  }

  const codesRaw = req.query.codes;
  if (!codesRaw || typeof codesRaw !== 'string' || !codesRaw.trim()) {
    return sendJson(res, error(1001, '参数 codes 必填'));
  }

  const codes = codesRaw
    .split(',')
    .map(c => c.trim())
    .filter(c => /^\d{6}$/.test(c));

  if (codes.length === 0) {
    return sendJson(res, error(1001, 'codes 参数需包含至少一个有效的 6 位基金代码'));
  }

  try {
    // 并发查询所有基金估值
    const results = await Promise.allSettled(codes.map(fetchSingleValuation));

    const data: ValuationItem[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value !== null) {
        data.push(result.value);
      }
    }

    return sendJson(res, success(data), 'public, max-age=60');
  } catch (err: unknown) {
    if (err instanceof FetchError) {
      return sendJson(res, error(err.code, err.message));
    }
    console.error('[valuation] 未预期错误:', err);
    return sendJson(res, error(1003, `估值查询失败: ${err instanceof Error ? err.message : String(err)}`));
  }
}
