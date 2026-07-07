import type { FundHolding } from '@/stores/fund'
import { STORAGE_KEY_HOLDINGS } from './constants'

/** 从 localStorage 加载持仓列表 */
export function loadHoldings(): FundHolding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HOLDINGS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

/** 保存持仓列表到 localStorage */
export function saveHoldings(holdings: FundHolding[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_HOLDINGS, JSON.stringify(holdings))
  } catch {
    // localStorage 写入失败（如配额不足），静默处理
    console.warn('[storage] 保存持仓数据失败')
  }
}
