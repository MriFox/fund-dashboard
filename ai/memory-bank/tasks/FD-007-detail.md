# FD-007：持仓盈亏详情页面

> 下发日期：2026-07-07 | 角色：R03 前端工程师 | 状态：📋 待分配  
> 前置依赖：FD-003（脚手架）+ FD-004（通用组件）  

---

## 🎯 完成目标

实现 P0-4 持仓盈亏详情页面（`/fund/:code` 路由），用户可查看单只基金的持有收益详情，并编辑份额和成本价。

---

## 📋 允许修改范围

### 可以创建：

```
src/pages/
└── FundDetail.vue             # 持仓盈亏详情页面
    （内联实现 FundHeader / HoldingForm / ProfitSummary / DeleteConfirm）
```

### 可以编辑（如需联调）：
- `src/stores/fund.ts`（如 updateCost/removeFund 逻辑需增强）

### 禁止操作：
- ❌ 不修改通用组件（FD-004）
- ❌ 不修改 services/router（FD-003）
- ❌ 不创建其他页面

---

## ✅ 验收标准

| # | 标准 | 判定方式 |
|---|------|---------|
| 1 | 页面路由 `/fund/:code` 正确渲染 `FundDetail.vue`，从路由参数读取基金代码 | 浏览器访问 `/fund/110022` |
| 2 | 页面顶部 `PageHeader` 显示基金名称 + 返回按钮（`showBack`），点击返回持仓总览 | 点击测试 |
| 3 | **FundHeader**：展示基金名称、代码、类型、当前估值/净值、今日涨跌（ProfitBadge） | 视觉检查 |
| 4 | **HoldingForm**：可编辑表单，字段：持有份额（数字输入）、成本净值（数字输入）、买入日期（日期选择器） | 表单交互测试 |
| 5 | 修改份额或成本净值后，**实时计算**并展示：持有成本、当前市值、持有收益金额、持有收益率 | 修改数值观察 |
| 6 | 点击 "保存" 按钮，更新 localStorage（useFundStore.updateCost），显示 "保存成功" 提示 | 保存后检查 localStorage |
| 7 | **ProfitSummary**：以卡片展示 "持有收益" 和 "持有收益率"，正值红色、负值绿色 | 不同盈亏场景测试 |
| 8 | 底部有 "删除基金" 按钮，点击弹出确认弹窗 "确定要删除该基金吗？" | 交互测试 |
| 9 | 确认删除后，从 localStorage 移除该基金（useFundStore.removeFund），跳转回 `/` | 删除后检查 |
| 10 | 加载中显示 SkeletonLoader | 慢网络模拟 |
| 11 | 加载失败显示 ErrorState + 重试按钮 | mock API 报错 |
| 12 | 基金未添加持仓信息（只有估值数据，无份额/成本）时，HoldingForm 字段为空，ProfitSummary 显示 "--" | 搜索添加后未录成本 |
| 13 | 移动端 375px 宽度下表单和卡片布局正常 | DevTools 模拟 |

---

## 🔖 分支命名

```
feature/fd-007-detail
```

从 `main` 分支创建。

---

## 📄 完工回报格式

```markdown
## FD-007 完工回报

### 1. 任务 ID：FD-007 / 持仓盈亏详情页面

### 2. 当前分支：feature/fd-007-detail

### 3. 修改文件清单

### 4. 核心实现说明
- 盈亏实时计算逻辑
- 表单双向绑定
- 删除确认交互

### 5. 验收标准逐条自查
- 标准 1：[达标/未达标]
- ...（逐条对照 13 条）

### 6. 现存问题 / 待解决

### 7. 交付产物
```

---

## 📎 参考文档

- 组件树（FundDetail）：`ai/memory-bank/architecture.md` 行 568-576
- FundHolding 接口：架构文档行 410-417
- updateCost / removeFund：架构文档行 465-466
- 总盈亏计算：架构文档行 445-457
