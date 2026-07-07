import { request } from './api'
import type { FundValuation, FundSearchResult } from '@/stores/fund'

/**
 * 批量获取基金实时估值
 * @param codes 基金代码数组
 */
export function fetchValuations(codes: string[]): Promise<FundValuation[]> {
  const params = codes.join(',')
  return request<FundValuation[]>(`/fund/valuation?codes=${encodeURIComponent(params)}`)
}

/**
 * 全市场基金搜索
 * @param keyword 基金名称或代码
 */
export function searchFunds(keyword: string): Promise<FundSearchResult[]> {
  return request<FundSearchResult[]>(`/fund/search?keyword=${encodeURIComponent(keyword)}`)
}

/**
 * 获取单只基金历史净值
 * @param code 基金代码
 * @param page 页码（从 1 开始）
 * @param size 每页条数
 */
export function fetchHistory(code: string, page = 1, size = 30): Promise<{
  code: string
  name: string
  total: number
  pageIndex: number
  pageSize: number
  items: Array<{ date: string; nav: number; accNav: number; change: number }>
}> {
  return request(`/fund/${code}/history?pageIndex=${page}&pageSize=${size}`)
}
