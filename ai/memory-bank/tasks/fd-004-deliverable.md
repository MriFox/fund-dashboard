# FD-004 交付概述

## 交付内容
9 个通用 UI 组件 + 1 个全局 App.vue 更新

## 构建状态
- `npm run build` ✅（46 模块，vite build 成功）
- `vue-tsc --noEmit` ✅（0 类型错误）
- PWA SW ✅（9 个 precache 条目自动生成）

## 组件清单
| 组件 | 文件 | Props | Emits |
|------|------|-------|-------|
| AppShell | src/components/AppShell.vue | — | — |
| NavBar | src/components/NavBar.vue | — | — |
| FundCard | src/components/FundCard.vue | fund: FundCardData | click |
| ProfitBadge | src/components/ProfitBadge.vue | change: number|null | — |
| SkeletonLoader | src/components/SkeletonLoader.vue | variant, width, height, repeat | — |
| EmptyState | src/components/EmptyState.vue | message?, actionLabel? | action |
| ErrorState | src/components/ErrorState.vue | message? | retry |
| NetworkStatus | src/components/NetworkStatus.vue | — | — |
| PageHeader | src/components/PageHeader.vue | title, showBack? | — |
