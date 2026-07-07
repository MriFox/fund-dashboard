<script setup lang="ts">
defineProps<{
  message?: string
  actionLabel?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <span class="i-carbon-information text-5xl text-[var(--text-secondary)] mb-4" />
    <p class="text-[15px] text-[var(--text-secondary)] mb-5">
      {{ message ?? '暂无数据' }}
    </p>
    <button
      v-if="actionLabel"
      class="px-6 h-11 rounded-[var(--radius-button)] bg-[#007aff] text-white text-[15px] font-medium
             active:bg-blue-700 transition-all duration-200 ease-out"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
