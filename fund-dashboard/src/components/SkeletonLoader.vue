<script setup lang="ts">
type SkeletonVariant = 'card' | 'text' | 'circle'

const props = withDefaults(defineProps<{
  variant?: SkeletonVariant
  width?: string
  height?: string
  repeat?: number
}>(), {
  variant: 'card',
  width: '100%',
  height: '16px',
  repeat: 1
})

const variantClasses: Record<SkeletonVariant, string> = {
  card: 'rounded-xl h-28 w-full',
  text: 'rounded h-4 w-full',
  circle: 'rounded-full h-10 w-10'
}
</script>

<template>
  <div
    v-for="i in repeat"
    :key="i"
    class="animate-pulse bg-gray-200"
    :class="[variantClasses[variant]]"
    :style="{
      width: variant === 'circle' ? height : width,
      height: variant === 'text' || variant === 'card' ? height : undefined
    }"
    role="status"
    aria-label="加载中"
  />
</template>
