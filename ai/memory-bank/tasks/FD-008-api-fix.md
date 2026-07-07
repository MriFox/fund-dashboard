# FD-008：后端 API 数据修复

> 下发日期：2026-07-07 | 角色：R02 后端工程师 | 状态：📋 待分配  
> 优先级：P0（阻塞前端功能）

---

## 🎯 完成目标

修复 Vercel 线上环境两个 API 返回空数组的问题，使基金搜索和大盘指数接口正常返回数据。

---

## 🐛 缺陷描述

| 接口 | 线上表现 | 预期 |
|------|---------|------|
| `GET /api/fund/search?keyword=易方达` | `{"code":0,"data":[]}` | 返回匹配的基金列表 |
| `GET /api/market/index` | `{"code":0,"data":[]}` | 返回三大指数实时行情 |

> 📍 参考：`GET /api/fund/valuation?codes=110022` 已正常返回真实数据，说明 fetcher.ts 的通用逻辑没问题，问题在 search 和 market/index 各自的上游数据解析。

---

## 📋 允许修改范围

### 可以编辑：

```
api/
├── fund/
│   └── search.ts              # 基金搜索 → 修复上游数据解析
├── market/
│   └── index.ts               # 大盘指数 → 修复上游数据解析
└── _lib/
    └── fetcher.ts             # 如有通用解析逻辑需要增强（可改，不影响现有接口）
```

### 禁止操作：
- ❌ 不修改 valuation.ts 和 history.ts（已验证正常）
- ❌ 不修改接口契约（路径/参数/响应格式不变）
- ❌ 不修改前端代码

---

## ✅ 验收标准

| # | 标准 | 判定方式 |
|---|------|---------|
| 1 | `GET /api/fund/search?keyword=易方达` 返回 ≥1 条匹配结果 | 访问 Vercel 线上地址验证 |
| 2 | `GET /api/fund/search?keyword=110022` 返回包含"易方达消费行业"的结果 | 线上验证 |
| 3 | `GET /api/market/index` 返回上证/深证/创业板 3 条数据，price/change 非 0 | 线上验证 |
| 4 | `GET /api/fund/search?keyword=xxx不存在` 返回 `{"code":0,"data":[]}`（空结果不算错误） | 边界验证 |
| 5 | `vercel dev` 本地可正常返回数据（非空数组） | 本地验证 |
| 6 | 如果上游接口返回格式变化，在 fetcher.ts 或对应文件增加兼容处理逻辑 | 代码审查 |

---

## 💡 排查方向

1. **search**：上游 `fund.eastmoney.com/js/fundcode_search.js` 返回的 JS 赋值格式可能与 `cleanJsonpResponse` 预期的不同。建议先在本地 curl 抓原始响应内容，对比解析逻辑。
2. **market/index**：上游 `push2.eastmoney.com/api/qt/ulist.np/get` 从 Vercel IP 访问时，返回的 JSON 结构可能缺少 `data` 字段或被限流。检查是否需要添加 Referer/User-Agent 头。

---

## 🔖 分支命名

```
fix/fd-008-api-data
```

从 `master` 分支创建。

---

## 📄 完工回报格式

```markdown
## FD-008 完工回报

### 1. 任务 ID：FD-008 / 后端 API 数据修复

### 2. 当前分支：fix/fd-008-api-data

### 3. 修改文件清单

### 4. 根因分析与修复说明
- search 接口：原始响应内容 → 解析失败原因 → 修复方式
- market/index 接口：同上

### 5. 验收标准逐条自查
- 标准 1：[达标/未达标] — 附线上 curl 结果
- ...（逐条对照 6 条）

### 6. 现存问题 / 待解决

### 7. 交付产物
```

---

## 📎 测试地址

线上地址：`https://fund-dashboard-jet.vercel.app`
