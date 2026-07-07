<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFundStore } from '@/stores/fund'
import { formatCurrency, formatChange } from '@/utils/format'
import ProfitBadge from '@/components/ProfitBadge.vue'
import PageHeader from '@/components/PageHeader.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import ErrorState from '@/components/ErrorState.vue'

const route = useRoute()
const router = useRouter()
const fundStore = useFundStore()

const fundCode = computed(() => route.params.code as string)

/* ───── 基金数据 ───── */

const loading = ref(true)

const holding = computed(() =>
  fundStore.holdings.find(h => h.code === fundCode.value)
)

const valuation = computed(() =>
  fundStore.valuations[fundCode.value] ?? null
)

/* ───── 表单绑定（本地副本） ───── */

const formShares = ref(0)
const formCost = ref(0)
const formDate = ref('')
const hasUnsaved = ref(false)
const saveSuccess = ref(false)

/* ───── 实时计算 ───── */

const currentValue = computed(() => {
  const price = valuation.value?.valuation ?? holding.value?.costNav ?? 0
  return price * formShares.value
})

const costTotal = computed(() => formCost.value * formShares.value)

const profitAmount = computed(() => currentValue.value - costTotal.value)

const profitRate = computed(() => {
  if (costTotal.value === 0) return 0
  return (profitAmount.value / costTotal.value) * 100
})

/* ───── 初始化表单 ───── */

function initForm() {
  if (holding.value) {
    formShares.value = holding.value.holdShares
    formCost.value = holding.value.costNav
    formDate.value = holding.value.buyDate
  }
}

watch(holding, (newHolding) => {
  if (newHolding) {
    formShares.value = newHolding.holdShares
    formCost.value = newHolding.costNav
    formDate.value = newHolding.buyDate
  }
})

/* ───── 保存 ───── */

function saveChanges() {
  if (!holding.value || formShares.value <= 0 || formCost.value <= 0) return
  fundStore.updateCost(fundCode.value, formShares.value, formCost.value)
  saveSuccess.value = true
  hasUnsaved.value = false
  setTimeout(() => { saveSuccess.value = false }, 2000)
}

/* ───── 删除 ───── */

const showDeleteConfirm = ref(false)

function openDeleteConfirm() {
  showDeleteConfirm.value = true
}

function confirmDelete() {
  fundStore.removeFund(fundCode.value)
  showDeleteConfirm.value = false
  router.replace('/')
}

/* ───── 加载 ───── */

async function loadData() {
  loading.value = true
  fundStore.loadHoldings()
  try {
    if (fundStore.holdings.length > 0) {
      await fundStore.fetchValuations()
    }
  } catch {
    // 静默处理，显示已有数据
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--bg-primary);">
    <!-- PageHeader -->
    <PageHeader :title="holding?.name ?? '基金详情'" :show-back="true">
      <template #right>
        <button
          class="text-[15px] font-medium text-[#007aff] active:opacity-60 transition-opacity"
          @click="saveChanges"
          :disabled="!hasUnsaved"
          :style="{ opacity: !hasUnsaved ? 0.4 : 1 }"
        >
          保存
        </button>
      </template>
    </PageHeader>

    <!-- 保存成功提示 -->
    <Transition name="fade">
      <div
        v-if="saveSuccess"
        class="mx-4 mt-3 px-3 py-2 rounded-[var(--radius-button)] text-[13px] font-medium text-center"
        style="background-color: color-mix(in srgb, var(--color-down) 12%, transparent); color: var(--color-down);"
      >
        保存成功
      </div>
    </Transition>

    <div v-if="loading" class="p-4 space-y-3">
      <SkeletonLoader variant="card" />
      <SkeletonLoader variant="card" />
      <SkeletonLoader variant="text" v-for="i in 4" :key="i" />
    </div>

    <ErrorState
      v-else-if="!holding && !loading"
      message="未找到该基金的持仓信息"
    />

    <template v-else-if="holding">
      <div class="px-4 pt-4 pb-8 space-y-3">
        <!-- FundHeader：估值信息 -->
        <div
          class="rounded-[var(--radius-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 space-y-2 transition-all duration-200 ease-out"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[17px] font-semibold text-[var(--text-primary)]">{{ holding.name }}</p>
              <p class="text-[13px] text-[var(--text-secondary)] mt-0.5">
                {{ holding.code }} · {{ holding.type }}
              </p>
            </div>
            <ProfitBadge v-if="valuation" :change="valuation.change" />
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-[22px] font-bold text-[var(--text-primary)] tabular-nums">
              {{ valuation ? formatCurrency(valuation.valuation) : '--' }}
            </span>
            <span class="text-[13px] text-[var(--text-secondary)]">
              {{ valuation ? `昨收 ${formatCurrency(valuation.nav)}` : '暂无估值' }}
            </span>
          </div>
        </div>

        <!-- ProfitSummary：持有收益 -->
        <div
          class="rounded-[var(--radius-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 space-y-3 transition-all duration-200 ease-out"
        >
          <h3 class="text-[13px] text-[var(--text-secondary)] font-medium">持有收益</h3>
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-[var(--text-secondary)]">持有收益</span>
            <span
              class="text-[17px] font-semibold tabular-nums"
              :class="profitAmount >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'"
            >
              {{ profitAmount >= 0 ? '+' : '' }}{{ formatCurrency(profitAmount) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-[var(--text-secondary)]">持有收益率</span>
            <span
              class="text-[17px] font-semibold tabular-nums"
              :class="profitRate >= 0 ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'"
            >
              {{ profitRate >= 0 ? '+' : '' }}{{ profitRate.toFixed(2) }}%
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-[var(--text-secondary)]">持有成本</span>
            <span class="text-[15px] font-semibold text-[var(--text-primary)] tabular-nums">
              {{ formatCurrency(costTotal) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[13px] text-[var(--text-secondary)]">当前市值</span>
            <span class="text-[15px] font-semibold text-[var(--text-primary)] tabular-nums">
              {{ formatCurrency(currentValue) }}
            </span>
          </div>
        </div>

        <!-- HoldingForm：编辑表单 -->
        <div
          class="rounded-[var(--radius-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] p-4 space-y-3 transition-all duration-200 ease-out"
        >
          <h3 class="text-[13px] text-[var(--text-secondary)] font-medium">编辑持仓</h3>
          <div>
            <label class="text-[13px] text-[var(--text-secondary)] mb-1 block">持有份额</label>
            <input
              v-model.number="formShares"
              type="number"
              step="0.01"
              min="0"
              class="w-full h-11 px-3 rounded-[var(--radius-button)] text-[15px]"
              style="background-color: #f2f2f7; color: var(--text-primary);"
              @input="hasUnsaved = true; saveSuccess = false"
            />
          </div>
          <div>
            <label class="text-[13px] text-[var(--text-secondary)] mb-1 block">成本净值</label>
            <input
              v-model.number="formCost"
              type="number"
              step="0.0001"
              min="0"
              class="w-full h-11 px-3 rounded-[var(--radius-button)] text-[15px]"
              style="background-color: #f2f2f7; color: var(--text-primary);"
              @input="hasUnsaved = true; saveSuccess = false"
            />
          </div>
          <div>
            <label class="text-[13px] text-[var(--text-secondary)] mb-1 block">买入日期</label>
            <input
              v-model="formDate"
              type="date"
              class="w-full h-11 px-3 rounded-[var(--radius-button)] text-[15px]"
              style="background-color: #f2f2f7; color: var(--text-primary);"
              @input="hasUnsaved = true; saveSuccess = false"
            />
          </div>
          <button
            class="w-full h-11 rounded-[var(--radius-button)] bg-[#007aff] text-white text-[15px] font-medium active:bg-blue-700 transition-all duration-200 ease-out"
            :disabled="!hasUnsaved"
            :style="{ opacity: !hasUnsaved ? 0.5 : 1 }"
            @click="saveChanges"
          >
            保存修改
          </button>
        </div>

        <!-- 删除按钮 -->
        <button
          class="w-full h-11 rounded-[var(--radius-button)] text-[15px] font-medium transition-all duration-200 ease-out active:bg-black/5"
          style="color: var(--color-up);"
          @click="openDeleteConfirm"
        >
          删除基金
        </button>
      </div>
    </template>

    <!-- 删除确认弹窗 -->
    <Transition name="modal">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[70] flex flex-col justify-end"
      >
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDeleteConfirm = false" />
        <div class="relative z-10 rounded-t-[16px] bg-white px-5 pt-6 pb-8 shadow-xl">
          <div class="flex flex-col items-center py-4">
            <span class="i-carbon-warning-alt text-4xl" style="color: var(--color-up);" />
            <h2 class="text-[17px] font-semibold text-[var(--text-primary)] mt-3">确定要删除该基金吗？</h2>
            <p class="text-[13px] text-[var(--text-secondary)] mt-1">删除后持仓数据将不可恢复</p>
          </div>
          <div class="flex gap-3 mt-4">
            <button
              class="flex-1 h-11 rounded-[var(--radius-button)] text-[15px] font-medium active:bg-black/5 transition-all duration-200 ease-out"
              style="background-color: #f2f2f7; color: var(--text-primary);"
              @click="showDeleteConfirm = false"
            >
              取消
            </button>
            <button
              class="flex-1 h-11 rounded-[var(--radius-button)] text-white text-[15px] font-medium active:opacity-80 transition-all duration-200 ease-out"
              style="background-color: var(--color-up);"
              @click="confirmDelete"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
