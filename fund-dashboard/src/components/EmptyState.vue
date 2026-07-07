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
    <span class="i-carbon-information text-5xl text-gray-300 mb-4" />
    <p class="text-gray-500 text-sm mb-4">
      {{ message ?? '暂无数据' }}
    </p>
    <button
      v-if="actionLabel"
      class="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium
             hover:bg-blue-700 active:bg-blue-800 transition-colors"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
