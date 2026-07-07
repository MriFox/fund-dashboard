<script setup lang="ts">
import AppShell from '@/components/AppShell.vue'
</script>

<template>
  <AppShell />
</template>

<style>
/* iOS 设计系统 — 全局变量 */
:root {
  --color-up: #ee3b3b;
  --color-down: #34c759;
  --bg-primary: #f2f2f7;
  --bg-card: #ffffff;
  --text-primary: #1c1c1e;
  --text-secondary: #8e8e93;
  --separator: #e5e5ea;
  --radius-card: 12px;
  --radius-button: 10px;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08);
  --font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* 移动端基础设置 */
html {
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-system);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 数字字体 — SF Mono / tabular-nums */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
