<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFundStore } from '@/stores/fund'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'

const router = useRouter()
const fundStore = useFundStore()

/* ───── 搜索状态 ───── */

const keyword = ref('')
const showResults = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/* ───── 添加弹窗状态 ───── */

const showModal = ref(false)
const selectedFund = ref<{ code: string; name: string; type: string } | null>(null)
const formShares = ref(0)
const formCost = ref(0)
const formDate = ref('')

/* ───── 防抖搜索 ───── */

function doSearch() {
  showResults.value = true
  fundStore.searchFunds(keyword.value)
}

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!keyword.value.trim()) {
    showResults.value = false
    fundStore.searchResults = []
    return
  }
  debounceTimer = setTimeout(doSearch, 300)
}

function onKeydownEnter() {
  if (debounceTimer) clearTimeout(debounceTimer)
  doSearch()
}

/* ───── 添加弹窗 ───── */

function openAddModal(fund: { code: string; name: string; type: string }) {
  selectedFund.value = fund
  formShares.value = 0
  formCost.value = 0
  formDate.value = new Date().toISOString().slice(0, 10)
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedFund.value = null
}

function confirmAdd() {
  if (!selectedFund.value || formShares.value <= 0 || formCost.value <= 0 || !formDate.value) return
  fundStore.addFund({
    code: selectedFund.value.code,
    name: selectedFund.value.name,
    type: selectedFund.value.type,
    holdShares: formShares.value,
    costNav: formCost.value,
    buyDate: formDate.value
  })
  closeModal()
  router.push('/')
}

function isInHoldings(code: string): boolean {
  return fundStore.holdingCodes.has(code)
}

/* ───── 生命周期 ───── */

onMounted(() => {
  fundStore.error = null
  fundStore.searchResults = []
})
</script>

<template>
  <div class="px-4 pt-4 pb-6">
    <!-- PageHeader -->
    <h1 class="text-[22px] font-bold text-[var(--text-primary)] mb-4 px-1">添加基金</h1>

    <!-- 搜索输入框（iOS 风格） -->
    <div class="relative mb-4">
      <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] i-carbon-search text-[17px]" />
      <input
        v-model="keyword"
        type="text"
        placeholder="输入基金代码或名称"
        class="w-full h-11 pl-10 pr-4 rounded-[var(--radius-button)] text-[15px]"
        style="background-color: #f2f2f7; color: var(--text-primary);"
        @input="onInput"
        @keydown.enter="onKeydownEnter"
      />
    </div>

    <!-- 搜索中 -->
    <div v-if="fundStore.loading && showResults" class="space-y-3">
      <SkeletonLoader variant="card" v-for="i in 5" :key="i" />
    </div>

    <!-- 搜索结果 -->
    <template v-if="!fundStore.loading && showResults">
      <!-- 错误 -->
      <ErrorState
        v-if="fundStore.error"
        message="搜索失败，请重试"
        @retry="doSearch"
      />

      <!-- 空结果 -->
      <EmptyState
        v-else-if="fundStore.searchResults.length === 0"
        message="未找到相关基金"
      />

      <!-- 结果列表 -->
      <div v-else class="space-y-2">
        <div
          v-for="fund in fundStore.searchResults"
          :key="fund.code"
          class="flex items-center justify-between px-4 py-3.5 rounded-[var(--radius-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-all duration-200 ease-out active:bg-black/5"
        >
          <div class="flex-1 min-w-0 mr-3">
            <p class="text-[15px] font-semibold text-[var(--text-primary)] truncate">{{ fund.name }}</p>
            <p class="text-[13px] text-[var(--text-secondary)] mt-0.5">{{ fund.code }} · {{ fund.type }}</p>
          </div>
          <button
            v-if="isInHoldings(fund.code)"
            class="shrink-0 px-3 h-9 rounded-[var(--radius-button)] text-[13px] font-medium"
            style="background-color: #e5e5ea; color: var(--text-secondary);"
            disabled
          >
            已添加
          </button>
          <button
            v-else
            class="shrink-0 px-4 h-9 rounded-[var(--radius-button)] bg-[#007aff] text-white text-[13px] font-medium active:bg-blue-700 transition-all duration-200 ease-out"
            @click="openAddModal(fund)"
          >
            添加
          </button>
        </div>
      </div>
    </template>
  </div>

  <!-- 添加弹窗（底部滑入） -->
  <Transition name="modal">
    <div
      v-if="showModal"
      class="fixed inset-0 z-[70] flex flex-col justify-end"
      @click.self="closeModal"
    >
      <!-- 毛玻璃遮罩 -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />

      <!-- 弹窗内容 -->
      <div
        class="relative z-10 rounded-t-[16px] bg-white px-5 pt-6 pb-8 shadow-xl"
      >
        <h2 class="text-[17px] font-semibold text-[var(--text-primary)] mb-1">
          添加持仓
        </h2>
        <p class="text-[13px] text-[var(--text-secondary)] mb-5">
          {{ selectedFund?.name }} ({{ selectedFund?.code }})
        </p>

        <!-- 表单字段 -->
        <div class="space-y-3">
          <div>
            <label class="text-[13px] text-[var(--text-secondary)] mb-1 block">持有份额</label>
            <input
              v-model.number="formShares"
              type="number"
              step="0.01"
              min="0"
              placeholder="输入持有份额"
              class="w-full h-11 px-3 rounded-[var(--radius-button)] text-[15px]"
              style="background-color: #f2f2f7; color: var(--text-primary);"
            />
          </div>
          <div>
            <label class="text-[13px] text-[var(--text-secondary)] mb-1 block">成本净值</label>
            <input
              v-model.number="formCost"
              type="number"
              step="0.0001"
              min="0"
              placeholder="输入买入时净值"
              class="w-full h-11 px-3 rounded-[var(--radius-button)] text-[15px]"
              style="background-color: #f2f2f7; color: var(--text-primary);"
            />
          </div>
          <div>
            <label class="text-[13px] text-[var(--text-secondary)] mb-1 block">买入日期</label>
            <input
              v-model="formDate"
              type="date"
              class="w-full h-11 px-3 rounded-[var(--radius-button)] text-[15px]"
              style="background-color: #f2f2f7; color: var(--text-primary);"
            />
          </div>
        </div>

        <!-- 按钮 -->
        <div class="flex gap-3 mt-6">
          <button
            class="flex-1 h-11 rounded-[var(--radius-button)] text-[15px] font-medium transition-all duration-200 ease-out active:bg-black/5"
            style="background-color: #f2f2f7; color: var(--text-primary);"
            @click="closeModal"
          >
            取消
          </button>
          <button
            class="flex-1 h-11 rounded-[var(--radius-button)] bg-[#007aff] text-white text-[15px] font-medium active:bg-blue-700 transition-all duration-200 ease-out"
            :disabled="formShares <= 0 || formCost <= 0 || !formDate"
            style="opacity: formShares <= 0 || formCost <= 0 || !formDate ? 0.5 : 1;"
            @click="confirmAdd"
          >
            确认添加
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .rounded-t-\[16px\],
.modal-leave-active .rounded-t-\[16px\] {
  transition: transform 0.3s ease-out;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .rounded-t-\[16px\],
.modal-leave-to .rounded-t-\[16px\] {
  transform: translateY(100%);
}
</style>
