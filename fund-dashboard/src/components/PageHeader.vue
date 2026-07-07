<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

withDefaults(defineProps<{
  title: string
  showBack?: boolean
}>(), {
  showBack: false
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 flex items-center h-11 px-4 bg-white border-b border-gray-100">
    <button
      v-if="showBack"
      class="flex items-center justify-center w-8 h-8 -ml-1 text-gray-600 hover:text-gray-900"
      aria-label="返回"
      @click="goBack"
    >
      <span class="i-carbon-arrow-left text-xl" />
    </button>
    <h1 class="text-base font-semibold text-gray-900 flex-1 truncate">
      {{ title }}
    </h1>
    <slot name="right" />
  </header>
</template>
