<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFundStore } from '@/stores/fund'
import { useUIStore } from '@/stores/ui'
import { useTradingHours } from '@/composables/useTradingHours'
import { useAutoRefresh } from '@/composables/useAutoRefresh'
import { useOfflineDetection } from '@/composables/useOfflineDetection'
import { formatCurrency, formatChange, formatNumber } from '@/utils/format'
import FundCard from '@/components/FundCard.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import MarketIndexCard from '@/components/MarketIndexCard.vue'
import AssetAllocation from '@/components/AssetAllocation.vue'

const router = useRouter()
const fundStore = useFundStore()
const uiStore = useUIStore()
const { isTradingHours } = useTradingHours()
const { isOnline } = useOfflineDetection()

const hasCachedData = ref(false)
const refreshFailed = ref(false)

/* ───── computed ───── */

const hasHoldings = computed(() => fundStore.holdings.length > 0)
const isFirstLoad = computed(() => fundStore.loading && !hasCachedData.value)
const showStaleData = computed(() => fundStore.error && hasCachedData.value)
const showError = computed(() => fundStore.error && !hasCachedData.value)

/* ───── 时段感知标签 ───── */

const timeLabel = computed(() => {
  if (!isTradingHours.value) {
    const now = new Date()
    const day = now.getDay()
    if (day === 0 || day === 6) return { text: '休市', class: 'badge-holiday' }
    return { text: '盘后', class: 'badge-after' }
  }
  return { text: '实时', class: 'badge-live' }
})

/* ───── 数据加载 ───── */

async function loadData() {
  fundStore.loadHoldings()
  const holdingsCount = fundStore.holdings.length
  hasCachedData.value = holdingsCount > 0

  if (holdingsCount === 0) return

  refreshFailed.value = false
  try {
    await fundStore.fetchValuations()
    if (!fundStore.error) {
      hasCachedData.value = true
    } else {
      refreshFailed.value = true
    }
  } catch {
    refreshFailed.value = true
  }
}

function handleRetry() {
  fundStore.error = null
  loadData()
}

function goToSearch() {
  router.push('/search')
}

function goToDetail(code: string) {
  router.push(`/fund/${code}`)
}

/* ───── 自动刷新 ───── */

useAutoRefresh(async () => {
  if (fundStore.holdings.length === 0) return
  await fundStore.fetchValuations()
}, 30_000)

/* ───── 生命周期 ───── */

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="px-4 pt-4 pb-6 space-y-3">
    <!-- PageHeader -->
    <header class="flex items-center justify-between mb-2 px-1">
      <h1 class="text-[22px] font-bold text-[var(--text-primary)]">持仓总览</h1>
      <span
        v-if="timeLabel"
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
        :class="timeLabel.class"
      >
        {{ timeLabel.text }}
      </span>
    </header>

    <!-- 离线提示（页面内） -->
    <div
      v-if="!isOnline"
      class="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-card)]"
      style="background-color: color-mix(in srgb, #ff9500 12%, transparent); color: #ff9500;"
    >
      <span class="i-carbon-warning text-sm shrink-0" />
      <span class="text-[13px] font-medium">当前处于离线模式，显示上次缓存数据</span>
    </div>

    <!-- 刷新失败提示（有缓存） -->
    <div
      v-if="showStaleData || refreshFailed"
      class="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-card)]"
      style="background-color: color-mix(in srgb, #ff9500 12%, transparent); color: #ff9500;"
    >
      <span class="i-carbon-warning-alt text-sm shrink-0" />
      <span class="text-[13px] font-medium">数据更新失败，显示上次数据</span>
    </div>

    <!-- 加载中（首次） -->
    <div v-if="isFirstLoad" class="space-y-3">
      <SkeletonLoader variant="card" v-for="i in 3" :key="i" />
    </div>

    <!-- MarketIndexCard：大盘指数 -->
    <MarketIndexCard v-if="hasHoldings && !isFirstLoad" />

    <!-- 有持仓 → 展示汇总 + 列表 -->
    <template v-if="hasHoldings && !isFirstLoad">
      <!-- 汇总卡片 -->
      <div
        class="rounded-[var(--radius-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 space-y-3 transition-all duration-200 ease-out"
      >
        <div class="flex justify-between items-center">
          <span class="text-[13px] text-[var(--text-secondary)]">总资产</span>
          <span class="text-[22px] font-bold text-[var(--text-primary)] tabular-nums">
            {{ formatCurrency(fundStore.totalAssets) }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[13px] text-[var(--text-secondary)]">总盈亏</span>
          <span
            class="text-[17px] font-semibold tabular-nums"
            :class="fundStore.totalProfit >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'"
          >
            {{ fundStore.totalProfit >= 0 ? '+' : '' }}{{ formatCurrency(fundStore.totalProfit) }}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-[13px] text-[var(--text-secondary)]">今日预估</span>
          <span
            class="text-[15px] font-semibold tabular-nums"
            :class="fundStore.todayProfit >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'"
          >
            {{ fundStore.todayProfit >= 0 ? '+' : '' }}{{ formatCurrency(fundStore.todayProfit) }}
          </span>
        </div>
      </div>

      <!-- 基金列表 -->
      <div class="space-y-3">
        <FundCard
          v-for="item in fundStore.holdingsWithValuation"
          :key="item.code"
          :fund="{ holding: item, valuation: item.valuation }"
          @click="goToDetail(item.code)"
        />
      </div>

      <!-- AssetAllocation：资产配置饼图 -->
      <AssetAllocation />
    </template>

    <!-- 错误（无缓存） -->
    <ErrorState
      v-if="showError"
      message="加载失败，请检查网络连接"
      @retry="handleRetry"
    />

    <!-- 空状态（无持仓） -->
    <EmptyState
      v-if="!hasHoldings && !fundStore.loading && !fundStore.error"
      message="还没有添加基金"
      action-label="去添加"
      @action="goToSearch"
    />
  </div>
</template>

<style scoped>
@keyframes pulse-live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.badge-live {
  color: var(--color-down);
  background-color: color-mix(in srgb, var(--color-down) 12%, transparent);
  animation: pulse-live 2s ease-in-out infinite;
}

.badge-after {
  color: var(--text-secondary);
  background-color: #e5e5ea;
}

.badge-holiday {
  color: var(--text-secondary);
  background-color: #e5e5ea;
}
</style>
