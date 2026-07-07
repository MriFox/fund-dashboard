<script setup lang="ts">
import { computed } from 'vue'
import { formatChange } from '@/utils/format'

const props = withDefaults(defineProps<{
  change: number | null | undefined
}>(), {
  change: undefined
})

const badgeClass = computed(() => {
  if (props.change == null || isNaN(props.change)) return 'badge-none'
  if (props.change > 0) return 'badge-up'
  if (props.change < 0) return 'badge-down'
  return 'badge-zero'
})

const displayText = computed(() => formatChange(props.change))
</script>

<template>
  <span
    class="inline-block px-2 py-0.5 rounded text-xs font-semibold leading-normal"
    :class="badgeClass"
    role="status"
    :aria-label="`涨跌幅 ${displayText}`"
  >
    {{ displayText }}
  </span>
</template>

<style scoped>
.badge-up {
  color: var(--color-up, #ef4444);
  background-color: color-mix(in srgb, var(--color-up, #ef4444) 12%, transparent);
}
.badge-down {
  color: var(--color-down, #22c55e);
  background-color: color-mix(in srgb, var(--color-down, #22c55e) 12%, transparent);
}
.badge-zero {
  color: #9ca3af;
  background-color: #f3f4f6;
}
.badge-none {
  color: #9ca3af;
  background-color: #f3f4f6;
}
</style>
