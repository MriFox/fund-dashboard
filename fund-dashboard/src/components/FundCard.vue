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
    class="flex items-center justify-between px-4 py-3.5 bg-[var(--bg-card)] rounded-[var(--radius-card)]
           shadow-[var(--shadow-card)] cursor-pointer
           active:bg-black/5 transition-all duration-200 ease-out"
    role="button"
    tabindex="0"
    :aria-label="`${fund.holding.name} 基金卡片`"
    @click="emit('click')"
    @keydown.enter="emit('click')"
    @keydown.space.prevent="emit('click')"
  >
    <!-- 左侧：名称 + 代码 -->
    <div class="flex-1 min-w-0 mr-3">
      <p class="text-[15px] font-semibold text-[var(--text-primary)] truncate">
        {{ fund.holding.name }}
      </p>
      <p class="text-[13px] text-[var(--text-secondary)] mt-0.5">
        {{ fund.holding.code }}
      </p>
    </div>

    <!-- 右侧：估值 + 涨跌 -->
    <div class="flex flex-col items-end shrink-0">
      <p class="text-[15px] font-semibold text-[var(--text-primary)] tabular-nums">
        {{ fund.valuation ? formatCurrency(fund.valuation.valuation) : formatCurrency(fund.holding.costNav) }}
      </p>
      <ProfitBadge
        v-if="fund.valuation"
        :change="fund.valuation.change"
      />
      <span v-else class="text-[13px] text-[var(--text-secondary)]">--</span>
    </div>
  </div>
</template>
