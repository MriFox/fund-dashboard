<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)

const onOnline = () => { isOnline.value = true }
const onOffline = () => { isOnline.value = false }

onMounted(() => {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
})
</script>

<template>
  <Transition name="slide">
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center
             h-9 bg-yellow-500 text-white text-sm font-medium shadow-md"
      role="alert"
      aria-live="assertive"
    >
      <span class="i-carbon-warning text-base mr-1.5" />
      当前处于离线模式
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
