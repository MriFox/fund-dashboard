<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useFundStore } from '@/stores/fund'
import { fetchHistory } from '@/services/fundService'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import ErrorState from '@/components/ErrorState.vue'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const fundStore = useFundStore()

const loading = ref(false)
const error = ref<string | null>(null)
const curveData = ref<{ date: string; rate: number }[]>([])

/* ───── 加权累计收益率 ───── */

const latestRate = computed(() => {
  if (curveData.value.length === 0) return 0
  return curveData.value[curveData.value.length - 1]?.rate ?? 0
})

/* ───── 加载数据 ───── */

async function loadCurve() {
  if (fundStore.holdings.length === 0) return
  loading.value = true
  error.value = null

  try {
    // 每只基金取近 1 年数据
    const codes = fundStore.holdings.map(h => h.code)
    const results = await Promise.allSettled(
      codes.map(code => fetchHistory(code, 1, 365))
    )

    // 按日期汇总加权收益率
    const dateMap = new Map<string, { totalWeight: number; weightedRate: number }>()

    results.forEach((res, i) => {
      const holding = fundStore.holdings[i]
      if (res.status !== 'fulfilled') return

      const cost = holding.costNav * holding.holdShares
      if (cost <= 0) return

      const items = [...res.value.items].reverse()
      if (items.length === 0) return

      const firstNav = items[0].nav

      items.forEach(d => {
        const fundRate = ((d.nav - firstNav) / firstNav) * 100
        const prev = dateMap.get(d.date) || { totalWeight: 0, weightedRate: 0 }
        prev.totalWeight += cost
        prev.weightedRate += cost * fundRate
        dateMap.set(d.date, prev)
      })
    })

    // 计算加权平均并正序输出
    const sorted = Array.from(dateMap.entries()).sort(([a], [b]) => a.localeCompare(b))
    const totalCost = fundStore.holdings.reduce((s, h) => s + h.costNav * h.holdShares, 0)

    curveData.value = sorted.map(([date, v]) => ({
      date,
      rate: totalCost > 0 ? v.weightedRate / totalCost : 0
    }))
  } catch {
    error.value = '加载收益数据失败'
  } finally {
    loading.value = false
  }
}

/* ───── ECharts 配置 ───── */

const chartOption = computed(() => {
  const data = curveData.value
  if (data.length === 0) return {}

  const lastRate = data[data.length - 1]?.rate ?? 0
  const trendUp = lastRate >= 0
  const color = trendUp ? '#ee3b3b' : '#34c759'

  return {
    grid: { left: 10, right: 10, top: 30, bottom: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date.slice(5)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#8e8e93', hideOverlap: true },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 11, color: '#8e8e93',
        formatter: (v: number) => v.toFixed(1) + '%'
      },
      splitLine: { lineStyle: { color: '#e5e5ea', type: 'dashed' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: color + '30' },
            { offset: 1, color: color + '05' }
          ]
        }
      },
      data: data.map(d => d.rate)
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(28,28,30,0.9)',
      borderWidth: 0,
      textStyle: { color: '#fff', fontSize: 13 },
      formatter: (params: any) => {
        const p = params[0]
        return `${data[p.dataIndex]?.date ?? ''}<br/>收益率: ${p.value != null ? (p.value >= 0 ? '+' : '') + p.value.toFixed(2) + '%' : '--'}`
      }
    }
  }
})

onMounted(() => {
  fundStore.loadHoldings()
  loadCurve()
})
</script>

<template>
  <div
    v-if="fundStore.holdings.length > 0"
    class="rounded-[var(--radius-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 transition-all duration-200 ease-out"
  >
    <div class="flex items-center justify-between mb-1">
      <h3 class="text-[13px] text-[var(--text-secondary)] font-medium">累计收益曲线</h3>
      <span
        v-if="!loading && curveData.length > 0"
        class="text-[15px] font-bold tabular-nums"
        :class="latestRate >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'"
      >
        {{ latestRate >= 0 ? '+' : '' }}{{ latestRate.toFixed(2) }}%
      </span>
    </div>

    <div v-if="loading">
      <SkeletonLoader variant="card" height="200px" />
    </div>

    <ErrorState
      v-else-if="error"
      :message="error"
      @retry="loadCurve"
    />

    <VChart
      v-else-if="curveData.length > 0"
      :option="chartOption"
      autoresize
      class="w-full"
      style="height: 220px;"
    />
  </div>
</template>
