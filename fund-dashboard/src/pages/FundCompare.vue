<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useFundStore } from '@/stores/fund'
import { fetchHistory } from '@/services/fundService'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const fundStore = useFundStore()

const LINE_COLORS = ['#007aff', '#ff9500', '#af52de']

/* ───── 选择状态 ───── */

const selected = ref<string[]>([])
const chartData = ref<Map<string, { date: string; rate: number }[]>>(new Map())
const chartLoading = ref(false)
const chartError = ref<string | null>(null)

const canSelect = computed(() => fundStore.holdings.length >= 2)

function toggleFund(code: string) {
  const idx = selected.value.indexOf(code)
  if (idx >= 0) {
    selected.value.splice(idx, 1)
  } else {
    if (selected.value.length >= 3) return
    selected.value.push(code)
  }
  if (selected.value.length > 0) loadSelectedData()
}

function isSelected(code: string) {
  return selected.value.includes(code)
}

/* ───── 加载数据 ───── */

async function loadSelectedData() {
  chartLoading.value = true
  chartError.value = null
  const map = new Map<string, { date: string; rate: number }[]>()
  try {
    const results = await Promise.allSettled(
      selected.value.map(code => fetchHistory(code, 1, 365))
    )
    results.forEach((res, i) => {
      const code = selected.value[i]
      if (res.status === 'fulfilled') {
        const sorted = [...res.value.items].reverse()
        const firstNav = sorted[0]?.nav ?? 1
        const items = sorted.map(d => ({
          date: d.date,
          rate: ((d.nav - firstNav) / firstNav) * 100
        }))
        map.set(code, items)
      }
    })
    chartData.value = map
  } catch {
    chartError.value = '加载数据失败'
  } finally {
    chartLoading.value = false
  }
}

/* ───── ECharts 配置 ───── */

const chartOption = computed(() => {
  const entries = Array.from(chartData.value.entries())
  if (entries.length === 0) return {}

  const nameMap = new Map(fundStore.holdings.map(h => [h.code, h.name]))

  // 合并所有日期轴
  const allDates = new Set<string>()
  entries.forEach(([, items]) => items.forEach(d => allDates.add(d.date)))
  const dates = Array.from(allDates).sort()

  const series = entries.map(([code, items], i) => {
    const itemMap = new Map(items.map(d => [d.date, d.rate]))
    return {
      name: nameMap.get(code) || code,
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: LINE_COLORS[i] },
      itemStyle: { color: LINE_COLORS[i] },
      data: dates.map(d => itemMap.get(d) ?? null)
    }
  })

  return {
    grid: {
      left: 10, right: 10, top: 40, bottom: 20,
      containLabel: true
    },
    legend: {
      data: series.map(s => s.name),
      type: 'scroll',
      bottom: 0,
      textStyle: { fontSize: 12, color: '#1c1c1e' },
      pageTextStyle: { color: '#8e8e93' }
    },
    xAxis: {
      type: 'category',
      data: dates,
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
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(28,28,30,0.9)',
      borderWidth: 0,
      textStyle: { color: '#fff', fontSize: 13 },
      formatter: (params: any) => {
        const date = params[0]?.axisValue || ''
        const lines = params.map((p: any) =>
          `<span style="color:${p.color}">●</span> ${p.seriesName}: ${p.value != null ? p.value.toFixed(2) + '%' : '--'}`
        )
        return `<div>${date}</div>${lines.join('<br/>')}`
      }
    },
    series
  }
})

onMounted(() => {
  fundStore.loadHoldings()
})
</script>

<template>
  <div class="px-4 pt-4 pb-20 space-y-4">
    <h1 class="text-[22px] font-bold text-[var(--text-primary)] px-1">基金对比</h1>

    <!-- 无持仓 -->
    <EmptyState
      v-if="fundStore.holdings.length === 0"
      message="请先添加基金"
      action-label="去添加"
      @action="$router.push('/search')"
    />

    <template v-else>
      <!-- 多选列表 -->
      <div
        class="rounded-[var(--radius-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 transition-all duration-200 ease-out"
      >
        <p class="text-[13px] text-[var(--text-secondary)] mb-3">
          选择 2-3 只基金进行对比
        </p>
        <div class="space-y-2">
          <label
            v-for="h in fundStore.holdings"
            :key="h.code"
            class="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button)] transition-all duration-200 ease-out active:bg-black/5"
            :class="isSelected(h.code)
              ? 'bg-[#007aff]/8'
              : ''"
            style="background-color: isSelected(h.code) ? 'color-mix(in srgb, #007aff 8%, transparent)' : '#f2f2f7';"
          >
            <input
              type="checkbox"
              :checked="isSelected(h.code)"
              :disabled="!isSelected(h.code) && selected.length >= 3"
              class="w-4 h-4 accent-[#007aff] shrink-0"
              @change="toggleFund(h.code)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-[15px] font-medium text-[var(--text-primary)] truncate">{{ h.name }}</p>
              <p class="text-[12px] text-[var(--text-secondary)]">{{ h.code }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- 图表卡片 -->
      <div
        class="rounded-[var(--radius-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 transition-all duration-200 ease-out"
      >
        <h3 class="text-[13px] text-[var(--text-secondary)] font-medium mb-1">近 1 年收益率对比</h3>

        <!-- 加载中 -->
        <div v-if="chartLoading" class="py-6">
          <SkeletonLoader variant="card" height="220px" />
        </div>

        <!-- 错误 -->
        <ErrorState
          v-else-if="chartError"
          :message="chartError"
          @retry="loadSelectedData"
        />

        <!-- 图表 -->
        <VChart
          v-else-if="selected.length > 0"
          :option="chartOption"
          autoresize
          class="w-full"
          style="height: 280px;"
        />

        <!-- 未选择提示 -->
        <div
          v-else
          class="flex items-center justify-center h-40 text-[13px] text-[var(--text-secondary)]"
        >
          请在上方选择基金
        </div>
      </div>
    </template>
  </div>
</template>
