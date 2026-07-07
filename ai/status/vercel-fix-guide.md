# Vercel 部署修复指南 — 个人基金看板 PWA

## 背景

项目已部署到 Vercel：`https://fund-dashboard-jet.vercel.app`

- ✅ 前端首页正常加载
- ❌ 所有 API 接口返回 500 错误（`FUNCTION_INVOCATION_FAILED`）

**原因**：Vercel 项目的 Root Directory 被设为 `fund-dashboard`，导致 Serverless Functions（位于项目根目录的 `api/`）无法被找到。

---

## 操作步骤

### 第 1 步：打开项目 Settings

浏览器访问：

```
https://vercel.com/fox25/fund-dashboard/settings
```

如果要求登录，用 GitHub 账号登录。

---

### 第 2 步：修改 General 设置

在 Settings 页面，找到 **General** 标签（默认已打开），修改以下 3 项：

| 配置项 | 当前值（错误） | 改为 |
|--------|---------------|------|
| **Root Directory** | `fund-dashboard` | **清空**（删除内容，留空白） |
| **Build Command** | `npm run build` | `cd fund-dashboard && npm install && npm run build` |
| **Output Directory** | `dist` | `fund-dashboard/dist` |

> ⚠️ Root Directory 一定要清空！这是导致 API 500 错误的根本原因。

其他选项不要动，下滑到页面底部点击 **Save**。

---

### 第 3 步：重新部署

1. 点击顶部导航的 **Deployments** 标签
2. 找到最新的部署记录（一般是最上面那条）
3. 点击右侧的 **⋯** (三个点) 按钮
4. 选择 **Redeploy**
5. 在弹出的确认框中点击 **Redeploy**

等待部署完成（约 1-2 分钟）。

---

### 第 4 步：验证 API

部署成功后，在浏览器中访问以下 3 个地址：

| 地址 | 预期结果 |
|------|---------|
| `https://fund-dashboard-jet.vercel.app/api/fund/search?keyword=易方达` | 返回 JSON 数组，包含基金搜索结果 |
| `https://fund-dashboard-jet.vercel.app/api/market/index` | 返回 JSON，包含上证/深证/创业板数据 |
| `https://fund-dashboard-jet.vercel.app/api/fund/valuation?codes=110022` | 返回 JSON，包含基金估值 |

> 注意：估值接口在非交易时段可能返回空数组，这是正常的。

3 个接口都返回 JSON（而不是 500 错误页面）即为修复成功。

---

### 第 5 步（可选）：如果仍报错

如果部署后仍报 500，说明还有残留的 `fund-dashboard/vercel.json` 在干扰。在 Vercel 项目中：

1. 删除或重命名 `fund-dashboard/vercel.json` 文件（根目录的 `vercel.json` 已经包含相同配置）
2. 重新推送代码到 GitHub
3. Vercel 会自动重新部署

如果部署构建失败（非 API 错误），可能是 `fund-dashboard/package-lock.json` 和 `package.json` 版本不一致，运行：

```bash
cd fund-dashboard
rm -rf node_modules package-lock.json
npm install
git add -A
git commit -m "fix: regenerate lock file"
git push
```

---

## 成功后通知 PM

部署验证通过后，把 `fund-dashboard-jet.vercel.app` 域名发回给 PM，确认 Vercel 基础设施就绪。后续页面开发完成后可随时推送自动部署。
