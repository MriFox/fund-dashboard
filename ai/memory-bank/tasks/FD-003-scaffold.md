# FD-003：Vue 项目脚手架 + 基础设施

> 下发日期：2026-07-07 | 角色：R03 前端工程师 | 状态：📋 待分配  
> 前置依赖：FD-001 ✅（架构设计已验收）  
> 并行任务：FD-002（后端 API，可用 mock 数据先行开发）

---

## 🎯 完成目标

从零搭建 Vue 3 + Vite + TypeScript 项目，配置 PWA、UnoCSS、Router、Pinia、Services、Composables、Utils，使项目可 `npm run dev` 启动并渲染空白 AppShell。

---

## 📋 允许修改范围

### 可以创建/编辑：

```
fund-dashboard/
├── index.html                    # Vite 入口 HTML
├── package.json                  # 依赖声明
├── vite.config.ts                # Vite + PWA 插件配置
├── uno.config.ts                 # UnoCSS 配置
├── vercel.json                   # Vercel 部署配置（rewrites 规则）
├── tsconfig.json                 # TypeScript 配置
├── .gitignore
│
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
└── src/
    ├── main.ts                   # 入口：注册 Router/Pinia/PWA
    ├── App.vue                   # 根组件
    ├── router/
    │   └── index.ts              # 3 条路由（/, /search, /fund/:code）
    ├── stores/
    │   ├── fund.ts               # useFundStore（持仓+估值+搜索）
    │   ├── market.ts             # useMarketStore（大盘指数）
    │   └── ui.ts                 # useUIStore（在线/交易时段/全局错误）
    ├── services/
    │   ├── api.ts                # fetch 封装（base URL, 5s 超时, 1 次重试, ApiError）
    │   ├── fundService.ts        # fetchValuations / searchFunds / fetchHistory
    │   └── marketService.ts      # fetchIndices
    ├── composables/
    │   ├── useAutoRefresh.ts     # 定时刷新（交易时段 30s，前台检测，防堆积）
    │   ├── useTradingHours.ts    # 交易时段判断（周一至五 9:25-15:05）
    │   └── useOfflineDetection.ts # navigator.onLine + online/offline 事件
    ├── utils/
    │   ├── format.ts             # 数字/百分比/日期格式化
    │   ├── storage.ts            # localStorage 读写封装（holdings 增删改查）
    │   └── constants.ts          # API_BASE_URL, TRADING_HOURS, REFRESH_INTERVAL
    └── assets/
        └── icons/                # PWA 图标占位（后续补充实际图标）
```

### 禁止操作：
- ❌ 不创建页面组件（pages/）— 那是 FD-005~007 的范围
- ❌ 不创建通用 UI 组件（components/）— 那是 FD-004 的范围
- ❌ 不修改架构文档

---

## ✅ 验收标准

| # | 标准 | 判定方式 |
|---|------|---------|
| 1 | `npm install && npm run dev` 成功启动，无编译错误 | 终端验证 |
| 2 | 浏览器访问 `localhost` 看到 App.vue 渲染的占位内容 | 浏览器验证 |
| 3 | `vite.config.ts` 包含 `VitePWA` 插件配置（registerType: 'autoUpdate'，workbox 含 3 类 runtimeCaching 规则） | 代码审查 |
| 4 | `uno.config.ts` 配置 presets（presetUno, presetIcons） | 代码审查 |
| 5 | `vercel.json` 配置 rewrites 规则：`/api/*` → `api/*` | 代码审查 |
| 6 | Router 3 条路由（`/`, `/search`, `/fund/:code`），使用 `createWebHistory` + 懒加载 | 代码审查 |
| 7 | `useFundStore` 按架构文档 6.1 实现 state/getters/actions（注意 totalProfit/todayProfit 可先返回 0，待 FD-005 联调） | 代码审查 |
| 8 | `useMarketStore` 按架构文档 6.2 实现 | 代码审查 |
| 9 | `useUIStore` 按架构文档 6.3 实现 | 代码审查 |
| 10 | `api.ts` 实现统一错误包装（ApiError 类，含 code/message），超时 5s，最多重试 1 次 | 代码审查 |
| 11 | `fundService.ts` 实现 3 个函数：`fetchValuations(codes)`, `searchFunds(keyword)`, `fetchHistory(code, page, size)`（可用 mock 返回，等 FD-002 联调） | 代码审查 |
| 12 | `marketService.ts` 实现 `fetchIndices(codes?)` | 代码审查 |
| 13 | `storage.ts` 实现 `loadHoldings()/saveHoldings(holdings)`，数据格式与架构 6.1 的 `FundHolding` 一致 | 代码审查 |
| 14 | `useTradingHours.ts` 返回 `isTradingHours` 计算属性（周一至五 9:25-15:05） | 代码审查 |
| 15 | `useAutoRefresh.ts` 接收 `callback` + `interval`，交易时段定时执行，`visibilitychange` 切回前台立即执行 | 代码审查 |
| 16 | `useOfflineDetection.ts` 响应 `online/offline` 事件，返回 `isOnline` ref | 代码审查 |
| 17 | `format.ts` 实现：数字千分位、百分比（+0.00% / -0.00%）、金额（¥X.XX） | 代码审查 |

---

## 🔖 分支命名

```
feature/fd-003-scaffold
```

从 `main` 分支创建。

---

## 📄 完工回报格式

```markdown
## FD-003 完工回报

### 1. 任务 ID：FD-003 / Vue 项目脚手架 + 基础设施

### 2. 当前分支：feature/fd-003-scaffold

### 3. 修改文件清单
- 列出所有新增/修改文件

### 4. 核心实现说明
- 项目初始化方式（create-vue / 手动）
- 关键配置选择说明
- Store 实现中的计算逻辑说明

### 5. 验收标准逐条自查
- 标准 1：[达标/未达标]
- ...（逐条对照 17 条）

### 6. 现存问题 / 待解决

### 7. 交付产物
- 文件清单
```

---

## 📎 参考文档

- 架构文档第五章（路由表）：行 361-400
- 架构文档第六章（Store 设计）：行 404-538
- 架构文档第八章（SW 缓存策略 + vite-plugin-pwa 配置）：行 586-650
- 架构文档第九章（交易时段）：行 653-683
- 架构文档第十章（错误处理）：行 686-717
- 架构文档第十一章 11.1（命名规范）：行 724-733
- 架构文档第十一章 11.2（SFC 结构顺序）：行 737-756
