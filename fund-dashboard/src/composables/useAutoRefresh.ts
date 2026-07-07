import { ref, onMounted, onUnmounted } from 'vue'
import { useTradingHours } from './useTradingHours'

/**
 * 定时刷新逻辑
 * - 交易时段：按 interval 定时执行 callback
 * - 非交易时段：停止自动刷新
 * - document.visibilitychange 切回前台时：立即执行一次（防堆积）
 *
 * @param callback  刷新回调
 * @param interval  刷新间隔（毫秒）
 */
export function useAutoRefresh(callback: () => Promise<void> | void, interval: number) {
  const { isTradingHours } = useTradingHours()
  const timerHandle = ref<ReturnType<typeof setInterval> | null>(null)
  const isPending = ref(false)

  /** 安全执行回调（防堆积） */
  const safeExecute = async () => {
    if (isPending.value) return
    isPending.value = true
    try {
      await callback()
    } finally {
      isPending.value = false
    }
  }

  /** 启动定时器 */
  const startTimer = () => {
    stopTimer()
    if (!isTradingHours.value) return
    timerHandle.value = setInterval(safeExecute, interval)
  }

  /** 停止定时器 */
  const stopTimer = () => {
    if (timerHandle.value !== null) {
      clearInterval(timerHandle.value)
      timerHandle.value = null
    }
  }

  /** 可见性变化处理 */
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      safeExecute()
      startTimer()
    } else {
      stopTimer()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
    startTimer()
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    stopTimer()
  })

  return { startTimer, stopTimer, isPending }
}
