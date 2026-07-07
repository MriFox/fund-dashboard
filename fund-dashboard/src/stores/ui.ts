import { defineStore } from 'pinia'
import { useTradingHours } from '@/composables/useTradingHours'

export const useUIStore = defineStore('ui', {
  state: () => ({
    isOnline: true,
    isTradingHours: false,
    activeTab: 'home' as string,
    globalError: null as string | null
  }),

  getters: {
    /** 是否可以自动刷新 */
    canAutoRefresh(state): boolean {
      return state.isOnline && state.isTradingHours
    },

    /** 刷新间隔：交易时段 30s，非交易时段 0（不刷新） */
    refreshInterval(): number {
      // 实际刷新间隔由 useAutoRefresh 控制
      return 0
    }
  },

  actions: {
    /** 更新在线状态 */
    setOnlineStatus(status: boolean) {
      this.isOnline = status
    },

    /** 判断当前是否交易时段 */
    checkTradingHours() {
      this.isTradingHours = useTradingHours().isTradingHours.value
    },

    /** 设置全局错误 */
    setGlobalError(msg: string | null) {
      this.globalError = msg
    }
  }
})
