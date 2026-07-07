import { defineStore } from 'pinia'
import { fetchIndices as fetchIndicesApi } from '@/services/marketService'

export interface MarketIndex {
  code: string
  name: string
  price: number
  change: number
  changeAmount: number
}

export const useMarketStore = defineStore('market', {
  state: () => ({
    indices: [] as MarketIndex[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    /** 上证指数 */
    shanghai(state): MarketIndex | undefined {
      return state.indices.find(i => i.code === '1.000001')
    },

    /** 深证成指 */
    shenzhen(state): MarketIndex | undefined {
      return state.indices.find(i => i.code === '0.399001')
    },

    /** 创业板指 */
    gem(state): MarketIndex | undefined {
      return state.indices.find(i => i.code === '0.399006')
    }
  },

  actions: {
    /** 拉取大盘指数 */
    async fetchIndices(codes?: string[]) {
      this.loading = true
      this.error = null
      try {
        this.indices = await fetchIndicesApi(codes)
      } catch (err: any) {
        this.error = err.message || '获取大盘指数失败'
      } finally {
        this.loading = false
      }
    }
  }
})
