<script setup lang="ts">
defineProps<{
  message?: string
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <span class="i-carbon-warning-alt text-5xl text-red-400 mb-4" />
    <p class="text-[15px] text-[var(--text-secondary)] mb-5">
      {{ message ?? '加载失败，请重试' }}
    </p>
    <button
      class="px-6 h-11 rounded-[var(--radius-button)] bg-[#007aff] text-white text-[15px] font-medium
             active:bg-blue-700 transition-all duration-200 ease-out"
      @click="emit('retry')"
    >
      重试
    </button>
  </div>
</template>
