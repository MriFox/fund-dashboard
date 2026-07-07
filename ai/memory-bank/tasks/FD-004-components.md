# FD-004：AppShell + 通用 UI 组件

> 下发日期：2026-07-07 | 角色：R03 前端工程师 | 状态：📋 待分配  
> 前置依赖：FD-003 ✅（脚手架就绪）  

---

## 🎯 完成目标

实现 PWA 应用壳（AppShell + NavBar）和全部可复用 UI 组件，构建应用的基础视觉框架。所有页面组件（FD-005~007）将依赖这些组件。

---

## 📋 允许修改范围

### 可以创建：

```
src/components/
├── AppShell.vue               # PWA 壳：顶部栏 + <RouterView> + 离线提示 + 底部导航
├── NavBar.vue                 # 底部导航栏（Tab：持仓 / 添加）
├── FundCard.vue               # 基金卡片（代码、名称、估值、涨跌、点击进入详情）
├── ProfitBadge.vue            # 涨跌徽章（红涨绿跌，+0.00% 格式）
├── SkeletonLoader.vue         # 骨架屏（通用脉冲动画占位）
├── EmptyState.vue             # 空状态占位（图标 + 文案 + 行动按钮）
├── ErrorState.vue             # 错误状态（图标 + 错误信息 + 重试按钮）
├── NetworkStatus.vue          # 离线提示条（顶部滑入 "当前处于离线模式"）
└── PageHeader.vue             # 页面标题栏（标题 + 可选的返回按钮 + 右侧操作）
```

### 可以编辑：
- `src/App.vue`（引入 AppShell）
- `src/main.ts`（如有全局样式需要注册）

### 禁止操作：
- ❌ 不创建页面组件（pages/）— 那是 FD-005~007
- ❌ 不修改 stores/services/router — 那是 FD-003

---

## ✅ 验收标准

| # | 标准 | 判定方式 |
|---|------|---------|
| 1 | `AppShell.vue` 包含 `<NetworkStatus>` + `<RouterView>` + `<NavBar>` 三层结构 | 代码审查 |
| 2 | `NavBar.vue` 包含 "持仓" 和 "添加" 两个 Tab，使用 `<router-link>`，当前路由高亮 | 浏览器点击测试 |
| 3 | `FundCard.vue` 展示：基金名称、代码、估值（或净值）、涨跌幅（ProfitBadge），点击触发 `$emit('click')` 或 `router.push` | 视觉检查 |
| 4 | `ProfitBadge.vue` 接收 `change: number` prop，正数红色 `+X.XX%`，负数绿色 `-X.XX%`，0 灰色 | 传不同值测试 |
| 5 | `SkeletonLoader.vue` 渲染灰色脉冲动画占位块，尺寸可配置（prop: width/height 或类型变体） | 视觉检查 |
| 6 | `EmptyState.vue` 接收 `message` + `actionLabel` + `@action` 事件，显示图标 + 文案 + 按钮 | 传不同 prop 测试 |
| 7 | `ErrorState.vue` 接收 `message` + `@retry` 事件，显示错误图标 + 描述 + 重试按钮 | 传 prop 测试 |
| 8 | `NetworkStatus.vue` 在线时不可见，离线时从顶部滑入黄色提示条 "当前处于离线模式" | 切换 offline 测试 |
| 9 | `PageHeader.vue` 接收 `title` prop + 可选 `showBack` prop，点击返回调用 `router.back()` | 多页面测试 |
| 10 | 所有组件使用 UnoCSS 原子类，不使用独立 CSS 文件（除非组件特有样式放在 `<style scoped>`） | 代码审查 |
| 11 | 移动端优先：在 375px 宽度下布局正常，无横向溢出 | Chrome DevTools 模拟 |
| 12 | 涨跌颜色通过 CSS 变量 `--color-up` / `--color-down` 定义，方便全局切换 | 代码审查 |

---

## 🔖 分支命名

```
feature/fd-004-components
```

从 `main` 分支创建。

---

## 📄 完工回报格式

```markdown
## FD-004 完工回报

### 1. 任务 ID：FD-004 / AppShell + 通用 UI 组件

### 2. 当前分支：feature/fd-004-components

### 3. 修改文件清单

### 4. 核心实现说明
- 每个组件的关键设计决策
- UnoCSS 使用方式

### 5. 验收标准逐条自查
- 标准 1：[达标/未达标]
- ...（逐条对照 12 条）

### 6. 现存问题 / 待解决

### 7. 交付产物
```

---

## 📎 参考文档

- 组件树：`ai/memory-bank/architecture.md` 行 542-582
- 涨跌颜色：架构文档非功能需求（红涨绿跌）
- 命名规范：架构文档 11.1
