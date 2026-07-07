/** Vercel BFF 部署后的 API 基准路径 */
export const API_BASE_URL = '/api'

/** 交易时段定义：周一至周五 9:25 ~ 15:05（含集合竞价缓冲） */
export const TRADING_HOURS = {
  START_HOUR: 9,
  START_MINUTE: 25,
  END_HOUR: 15,
  END_MINUTE: 5
} as const

/** 自动刷新间隔（交易时段） */
export const REFRESH_INTERVAL = 30_000 // 30s

/** localStorage key */
export const STORAGE_KEY_HOLDINGS = 'fund_holdings'
