<script setup lang="ts">
import NetworkStatus from './NetworkStatus.vue'
import NavBar from './NavBar.vue'
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--bg-primary); padding-bottom: 56px;">
    <!-- 离线提示条 -->
    <NetworkStatus />

    <!-- 主内容区域 -->
    <main class="mx-auto max-w-lg">
      <RouterView />
    </main>

    <!-- 底部导航 -->
    <NavBar />
  </div>
</template>

<style scoped>
/* 移动端适配 */
@media (max-width: 480px) {
  main {
    max-width: 100%;
  }
}
</style>
