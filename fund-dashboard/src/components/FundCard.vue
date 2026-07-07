<script setup lang="ts">
import ProfitBadge from './ProfitBadge.vue'
import { formatCurrency } from '@/utils/format'
import type { FundHolding, FundValuation } from '@/stores/fund'

interface FundCardData {
  holding: FundHolding
  valuation?: FundValuation | null
}

defineProps<{
  fund: FundCardData
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="flex items-center justify-between px-4 py-3.5 bg-white rounded-xl
           border border-gray-100 shadow-sm cursor-pointer
           hover:border-gray-200 active:bg-gray-50 transition-colors"
    role="button"
    tabindex="0"
    :aria-label="`${fund.holding.name} 基金卡片`"
    @click="emit('click')"
    @keydown.enter="emit('click')"
    @keydown.space.prevent="emit('click')"
  >
    <!-- 左侧：名称 + 代码 -->
    <div class="flex-1 min-w-0 mr-3">
      <p class="text-sm font-semibold text-gray-900 truncate">
        {{ fund.holding.name }}
      </p>
      <p class="text-xs text-gray-400 mt-0.5">
        {{ fund.holding.code }}
      </p>
    </div>

    <!-- 右侧：估值 + 涨跌 -->
    <div class="flex flex-col items-end shrink-0">
      <p class="text-sm font-semibold text-gray-900 tabular-nums">
        {{ fund.valuation ? formatCurrency(fund.valuation.valuation) : formatCurrency(fund.holding.costNav) }}
      </p>
      <ProfitBadge
        v-if="fund.valuation"
        :change="fund.valuation.change"
      />
      <span v-else class="text-xs text-gray-400">--</span>
    </div>
  </div>
</template>
