/**
 * 数字千分位格式化
 * 例: 1234567.89 → "1,234,567.89"
 */
export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value == null || isNaN(value)) return '--'
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * 涨跌幅格式化（带正负号 + 百分号）
 * 例: 0.51 → "+0.51%", -0.28 → "-0.28%"
 */
export function formatChange(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '--'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * 金额格式化（含人民币符号）
 * 例: 1234.5 → "¥1,234.50"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '--'
  return `¥${formatNumber(value, 2)}`
}

/**
 * 日期格式化 YYYY-MM-DD
 */
export function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
