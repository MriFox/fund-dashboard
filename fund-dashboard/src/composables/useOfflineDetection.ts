import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 离线状态检测
 * 基于 navigator.onLine + online/offline 事件
 */
export function useOfflineDetection() {
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

  return { isOnline }
}
