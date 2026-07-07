/**
 * GET /api/market/index
 *
 * 获取大盘指数实时行情
 * 数据源：push2.eastmoney.com/api/qt/ulist.np/get
 *
 * 参数：
 *   codes  string  optional  指数代码，逗号分隔
 *                             默认：1.000001,0.399001,0.399006
 *                             （上证指数、深证成指、创业板指）
 *
 * 缓存策略：Cache-Control: public, max-age=60
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { success, error, sendJson } from '../_lib/response';
import { fetchJson, FetchError } from '../_lib/fetcher';

// ─── 上游数据格式 ────────────────────────────────────────────────────
// 东方财富行情接口（ulist.np/get）返回 JSON：
// {
//   "data": [
//     {
//       "f12": "1.000001",    // 指数代码
//       "f14": "上证指数",     // 指数名称
//       "f2": 3210.55,        // 最新价
//       "f3": 0.35,           // 涨跌幅 (%)
//       "f4": 11.23           // 涨跌额
//     },
//     ...
//   ]
// }

interface RawIndexItem {
  f12: string;   // 指数代码
  f14: string;   // 指数名称
  f2: number;    // 最新价
  f3: number;    // 涨跌幅 (%)
  f4: number;    // 涨跌额
}

interface RawMarketResponse {
  data: RawIndexItem[];
}

// ─── 输出格式 ────────────────────────────────────────────────────────

interface IndexItem {
  code: string;
  name: string;
  price: number;
  change: number;
  changeAmount: number;
}

// 指数代码 -> 名称映射（上游有时返回空名称时的 fallback）
const INDEX_NAMES: Record<string, string> = {
  '1.000001': '上证指数',
  '0.399001': '深证成指',
  '0.399006': '创业板指',
  '1.000688': '科创50',
  '0.399300': '沪深300',
  '1.000016': '上证50',
};

// ─── 入口 ────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, error(1001, '仅支持 GET 请求'));
  }

  const codesRaw = req.query.codes as string | undefined;
  const codes = codesRaw
    ? codesRaw.split(',').map(c => c.trim()).filter(Boolean)
    : ['1.000001', '0.399001', '0.399006'];

  // 校验格式：数字.数字
  for (const code of codes) {
    if (!/^\d+\.\d+$/.test(code)) {
      return sendJson(res, error(1001, `无效指数代码格式: ${code}（应为 market.market，如 1.000001）`));
    }
  }

  try {
    // 东方财富批量行情查询
    const secids = codes.join(',');
    const url =
      `https://push2.eastmoney.com/api/qt/ulist.np/get` +
      `?fltt=2&fields=f2,f3,f4,f12,f14&secids=${secids}&_=${Date.now()}`;

    const raw = await fetchJson<RawMarketResponse>(url);

    // 上游 data 存在但可能为空
    const rawList = raw?.data ?? [];

    const data: IndexItem[] = rawList.map((item: RawIndexItem) => ({
      code: item.f12 || '',
      name: item.f14 || INDEX_NAMES[item.f12] || '未知指数',
      price: item.f2 ?? 0,
      change: item.f3 ?? 0,
      changeAmount: item.f4 ?? 0,
    }));

    return sendJson(res, success(data), 'public, max-age=60');
  } catch (err: unknown) {
    if (err instanceof FetchError) {
      return sendJson(res, error(err.code, err.message));
    }
    console.error('[market/index] 未预期错误:', err);
    return sendJson(res, error(1003, `行情查询失败: ${err instanceof Error ? err.message : String(err)}`));
  }
}
