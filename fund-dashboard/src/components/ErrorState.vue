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
    <p class="text-gray-600 text-sm mb-4">
      {{ message ?? '加载失败，请重试' }}
    </p>
    <button
      class="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium
             hover:bg-gray-50 active:bg-gray-100 transition-colors"
      @click="emit('retry')"
    >
      重试
    </button>
  </div>
</template>
