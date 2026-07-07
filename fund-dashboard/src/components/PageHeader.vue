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
  <header class="sticky top-0 z-40 flex items-center h-12 px-4 bg-white/80 backdrop-blur-lg border-b border-[var(--separator)] transition-all duration-200 ease-out">
    <button
      v-if="showBack"
      class="flex items-center justify-center w-8 h-8 -ml-1 text-blue-500 active:bg-black/5 rounded-lg transition-all duration-200 ease-out"
      aria-label="返回"
      @click="goBack"
    >
      <span class="i-carbon-arrow-left text-xl" />
    </button>
    <h1 class="text-lg font-bold text-[var(--text-primary)] flex-1 truncate">
      {{ title }}
    </h1>
    <slot name="right" />
  </header>
</template>
