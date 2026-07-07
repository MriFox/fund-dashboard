import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HoldingsOverview.vue'),
    meta: { title: '持仓总览' }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/pages/FundSearch.vue'),
    meta: { title: '添加基金' }
  },
  {
    path: '/fund/:code',
    name: 'fund-detail',
    component: () => import('@/pages/FundDetail.vue'),
    meta: { title: '基金详情' }
  },
  {
    path: '/compare',
    name: 'compare',
    component: () => import('@/pages/FundCompare.vue'),
    meta: { title: '基金对比' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
