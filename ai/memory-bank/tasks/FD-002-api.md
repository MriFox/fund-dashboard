# FD-002：Vercel Functions 数据代理层

> 下发日期：2026-07-07 | 角色：R02 后端工程师 | 状态：📋 待分配  
> 前置依赖：FD-001 ✅ 已验收（接口契约见 architecture.md 第四章）

---

## 🎯 完成目标

实现 4 个 Vercel Serverless Functions，代理天天基金和东方财富的公开 API，为前端提供统一的 CORS 友好的数据接口。

---

## 📋 允许修改范围

### 可以创建/编辑：

```
api/
├── fund/
│   ├── valuation.ts           # GET /api/fund/valuation — 批量估值查询
│   ├── search.ts              # GET /api/fund/search — 基金搜索
│   └── [code]/
│       └── history.ts         # GET /api/fund/[code]/history — 单基金历史净值
├── market/
│   └── index.ts               # GET /api/market/index — 大盘指数
└── _lib/
    ├── response.ts            # 统一响应格式化 { code, data, message, timestamp }
    ├── fetcher.ts             # HTTP 请求封装（5s 超时、1 次重试）
    └── cache.ts               # 服务端内存 LRU 缓存
```

### 禁止操作：
- ❌ 不修改 `architecture.md` 中的接口契约
- ❌ 不修改前端代码（src/）
- ❌ 不修改项目章程

---

## ✅ 验收标准

| # | 标准 | 判定方式 |
|---|------|---------|
| 1 | `GET /api/fund/valuation?codes=110022,005827` 返回 JSON，格式与契约一致 | curl 测试 |
| 2 | `GET /api/fund/110022/history?pageSize=5` 返回历史净值，格式与契约一致 | curl 测试 |
| 3 | `GET /api/fund/search?keyword=易方达` 返回搜索结果列表 | curl 测试 |
| 4 | `GET /api/market/index` 返回上证/深证/创业板数据 | curl 测试 |
| 5 | 所有响应使用 `{ code: 0, data, message, timestamp }` 统一格式 | 逐接口检查 |
| 6 | 上游超时时返回 `code: 1002`，不 crash | 断网/超时模拟 |
| 7 | 参数错误时返回 `code: 1001` | 缺参数测试 |
| 8 | `/api/fund/valuation` 响应头含 `Cache-Control: public, max-age=60` | 检查响应头 |
| 9 | `/api/fund/[code]/history` 响应头含 `Cache-Control: public, max-age=3600` | 检查响应头 |
| 10 | `/api/fund/search` 首次请求拉取全量基金列表后缓存 24h，后续请求内存匹配 | 日志验证 |
| 11 | `vercel dev` 本地可启动并测试所有 4 个接口 | 本地验证 |
| 12 | 代码需处理天天基金/东方财富返回的非法 JSON/JS 格式（回调函数包裹等） | 检查解析逻辑 |
| 13 | `_lib/response.ts` 提供 `success(data)` 和 `error(code, msg)` 两个导出函数 | 代码审查 |

---

## 🔖 分支命名

```
feature/fd-002-api
```

从 `main` 分支创建。

---

## 📄 完工回报格式

```markdown
## FD-002 完工回报

### 1. 任务 ID：FD-002 / Vercel Functions 数据代理层

### 2. 当前分支：feature/fd-002-api

### 3. 修改文件清单
- 列出所有新增/修改文件

### 4. 核心实现说明
- 每个端点的数据解析逻辑简述
- 上游数据格式异常时的处理方式
- 缓存实现方式

### 5. 验收标准逐条自查
- 标准 1：[达标/未达标] — curl 输出截图或结果
- 标准 2：[达标/未达标] — curl 输出截图或结果
- ...（逐条对照 13 条）

### 6. 现存问题 / 待解决
- 发现的上游数据异常或边界情况

### 7. 交付产物
- 文件清单
```

---

## 📎 参考文档

- 接口契约：`ai/memory-bank/architecture.md` 第四章（行 209-358）
- 统一规范：行 212-221（Base URL、响应格式、错误码、超时、缓存）
- 数据源照表：行 352-357
