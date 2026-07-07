/**
 * GET /api/fund/search
 *
 * 全市场基金搜索
 * 数据源：fund.eastmoney.com/js/fundcode_search.js
 *
 * 实现策略（按契约）：
 * 1. 首次请求一次性拉取全量基金列表（~150KB）
 * 2. 服务端 LRU 缓存 24 小时（ttl=86400000）
 * 3. 后续请求在内存中做文本匹配
 * 4. 匹配规则：keyword 匹配基金代码（前缀）或基金名称（包含）
 *
 * 参数：
 *   keyword  string  required  基金名称或代码
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { success, error, sendJson } from '../_lib/response';
import { fetchText, cleanJsonpResponse, FetchError } from '../_lib/fetcher';
import { LRUCache } from '../_lib/cache';

// ─── 基金列表类型 ────────────────────────────────────────────────────
// 上游数据格式（JS 变量赋值）：共 5 个元素
//   var r = [["110022","YFDXFHYYPGP","易方达消费行业股票","股票型","YIFANGDAXIAOFEIHANGYEGUPIAO"],
//            ["000001","HXCZHH","华夏成长混合","混合型-灵活","HUAXIACHENGZHANGHUNHE"],...];
//             ^code    ^pinyin   ^name            ^type              ^pinyinFull

type RawFundItem = [string, string, string, string, string];

interface FundItem {
  code: string;
  name: string;
  type: string;
}

// ─── 全局缓存 ────────────────────────────────────────────────────────

const fundListCache = new LRUCache<FundItem[]>(1, 86_400_000); // 24h TTL, 最多 1 条

const SEARCH_CACHE_KEY = 'full_fund_list';

// ─── 数据加载 ────────────────────────────────────────────────────────

async function loadFullFundList(): Promise<FundItem[]> {
  const cached = fundListCache.get(SEARCH_CACHE_KEY);
  if (cached) {
    console.log('[search] 命中缓存，条数:', cached.length);
    return cached;
  }

  console.log('[search] 缓存未命中，全量拉取基金列表...');
  const url = 'https://fund.eastmoney.com/js/fundcode_search.js';
  const rawText = await fetchText(url);
  const cleaned = cleanJsonpResponse(rawText);
  const rawList = JSON.parse(cleaned) as RawFundItem[];

  const fundList: FundItem[] = rawList.map(([code, _pinyin, name, type]) => ({
    code,
    name,
    type,
  }));

  fundListCache.set(SEARCH_CACHE_KEY, fundList);
  console.log('[search] 全量拉取完成，条数:', fundList.length);

  return fundList;
}

// ─── 搜索匹配 ────────────────────────────────────────────────────────

function searchFunds(list: FundItem[], keyword: string): FundItem[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];

  return list.filter((item) => {
    // 代码前缀匹配（输入 "110" 匹配 "110022"）
    if (item.code.toLowerCase().startsWith(kw)) return true;
    // 名称包含匹配
    if (item.name.toLowerCase().includes(kw)) return true;
    // 拼音/拼音首字母（已有索引位，可选匹配）
    return false;
  });
}

// ─── 入口 ────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, error(1001, '仅支持 GET 请求'));
  }

  const keyword = req.query.keyword;
  if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
    return sendJson(res, error(1001, '参数 keyword 必填'));
  }

  try {
    const fullList = await loadFullFundList();
    const results = searchFunds(fullList, keyword);

    // 限制返回条数，避免 payload 过大
    const limited = results.slice(0, 50);

    return sendJson(res, success(limited));
  } catch (err: unknown) {
    if (err instanceof FetchError) {
      return sendJson(res, error(err.code, err.message));
    }
    console.error('[search] 未预期错误:', err);
    return sendJson(res, error(1003, `搜索失败: ${err instanceof Error ? err.message : String(err)}`));
  }
}
