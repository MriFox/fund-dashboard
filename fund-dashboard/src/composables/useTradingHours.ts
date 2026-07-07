import { computed } from 'vue'
import { TRADING_HOURS } from '@/utils/constants'

/**
 * 交易时段检测
 * 周一至周五 9:25 ~ 15:05（含集合竞价缓冲）
 */
export function useTradingHours() {
  const isTradingHours = computed(() => {
    const now = new Date()
    const day = now.getDay() // 0=周日, 1-5=周一~五, 6=周六
    if (day === 0 || day === 6) return false

    const hour = now.getHours()
    const minute = now.getMinutes()

    const start = TRADING_HOURS.START_HOUR * 60 + TRADING_HOURS.START_MINUTE
    const end = TRADING_HOURS.END_HOUR * 60 + TRADING_HOURS.END_MINUTE
    const current = hour * 60 + minute

    return current >= start && current <= end
  })

  return { isTradingHours }
}
