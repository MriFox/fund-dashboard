<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const tabs = [
  { label: '持仓', path: '/', icon: 'i-carbon-wallet' },
  { label: '对比', path: '/compare', icon: 'i-carbon-chart-line' },
  { label: '添加', path: '/search', icon: 'i-carbon-search' }
] as const

const activeIndex = computed(() => tabs.findIndex(t => t.path === route.path))
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around
           border-t border-[var(--separator)] bg-white/80 backdrop-blur-lg transition-all duration-200 ease-out"
    role="navigation"
    aria-label="底部导航"
  >
    <router-link
      v-for="(tab, i) in tabs"
      :key="tab.path"
      :to="tab.path"
      class="flex flex-col items-center justify-center gap-0.5 px-6 py-1 transition-all duration-200 ease-out active:bg-black/5"
      :class="i === activeIndex ? 'text-blue-600' : 'text-gray-400'"
      :aria-current="i === activeIndex ? 'page' : undefined"
    >
      <span :class="[tab.icon, 'text-xl']" />
      <span class="text-xs">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>
