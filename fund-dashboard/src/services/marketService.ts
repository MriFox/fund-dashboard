import { request } from './api'
import type { MarketIndex } from '@/stores/market'

/**
 * 获取大盘指数实时行情
 * @param codes 指数代码数组，默认 ['1.000001','0.399001','0.399006']
 */
export function fetchIndices(codes?: string[]): Promise<MarketIndex[]> {
  const defaultCodes = ['1.000001', '0.399001', '0.399006']
  const target = codes ?? defaultCodes
  const params = target.join(',')
  return request<MarketIndex[]>(`/market/index?codes=${encodeURIComponent(params)}`)
}
