import { defineStore } from 'pinia'
import { loadHoldings, saveHoldings } from '@/utils/storage'
import * as fundService from '@/services/fundService'

/* ───── 类型定义 ───── */

export interface FundHolding {
  code: string
  name: string
  type: string
  holdShares: number
  costNav: number
  buyDate: string
}

export interface FundValuation {
  code: string
  name: string
  nav: number
  valuation: number
  change: number
  changeAmount: number
  updateTime: string
}

export interface FundSearchResult {
  code: string
  name: string
  type: string
}

/* ───── Store ───── */

export const useFundStore = defineStore('fund', {
  state: () => ({
    holdings: [] as FundHolding[],
    valuations: {} as Record<string, FundValuation>,
    searchResults: [] as FundSearchResult[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    /** 持仓 + 估值合并数据 */
    holdingsWithValuation(state) {
      return state.holdings.map(h => ({
        ...h,
        valuation: state.valuations[h.code] ?? null
      }))
    },

    /** 总资产（估算） */
    totalAssets(state): number {
      return state.holdings.reduce((sum, h) => {
        const v = state.valuations[h.code]
        return sum + (v ? v.valuation * h.holdShares : 0)
      }, 0)
    },

    /** 总成本 */
    totalCost(state): number {
      return state.holdings.reduce((sum, h) => sum + h.costNav * h.holdShares, 0)
    },

    /** 总盈亏金额 */
    totalProfit(): number {
      // 待 FD-005 联调后实现：totalAssets - totalCost
      return 0
    },

    /** 今日预估盈亏 */
    todayProfit(): number {
      // 待 FD-005 联调后实现：Σ(涨跌额 * 持有份额)
      return 0
    }
  },

  actions: {
    /** 从 localStorage 加载持仓 */
    loadHoldings() {
      this.holdings = loadHoldings()
    },

    /** 持久化到 localStorage */
    saveHoldings() {
      saveHoldings(this.holdings)
    },

    /** 添加基金到持仓 */
    addFund(fund: FundHolding) {
      const exists = this.holdings.some(h => h.code === fund.code)
      if (exists) return
      this.holdings.push(fund)
      this.saveHoldings()
    },

    /** 移除基金 */
    removeFund(code: string) {
      this.holdings = this.holdings.filter(h => h.code !== code)
      this.saveHoldings()
    },

    /** 更新成本和份额 */
    updateCost(code: string, shares: number, costNav: number) {
      const fund = this.holdings.find(h => h.code === code)
      if (!fund) return
      fund.holdShares = shares
      fund.costNav = costNav
      this.saveHoldings()
    },

    /** 批量拉取估值（调用 fundService） */
    async fetchValuations() {
      const codes = this.holdings.map(h => h.code)
      if (codes.length === 0) return
      this.loading = true
      this.error = null
      try {
        const list = await fundService.fetchValuations(codes)
        const map: Record<string, FundValuation> = {}
        list.forEach(v => { map[v.code] = v })
        this.valuations = map
      } catch (err: any) {
        this.error = err.message || '获取估值失败'
      } finally {
        this.loading = false
      }
    },

    /** 搜索基金 */
    async searchFunds(keyword: string) {
      if (!keyword.trim()) {
        this.searchResults = []
        return
      }
      this.loading = true
      this.error = null
      try {
        this.searchResults = await fundService.searchFunds(keyword)
      } catch (err: any) {
        this.error = err.message || '搜索失败'
        this.searchResults = []
      } finally {
        this.loading = false
      }
    }
  }
})
