# Vercel 部署操作指南 — 个人基金看板 PWA

## 背景

项目仓库：`https://github.com/MriFox/fund-dashboard`  
代码已在 `master` 分支，目录结构：

```
fund-dashboard/
├── api/              # Vercel Serverless Functions（后端 API 代理）
└── fund-dashboard/   # Vue 3 + Vite PWA 前端源码（部署根目录）
```

---

## 第一步：删除错误的 Vercel 项目

之前误导入了 `Fund-Break-Even-Calculator`，需要先删掉：

1. 打开 [vercel.com](https://vercel.com) 并登录（账号：fox25）
2. 在 Dashboard 左侧列表找到项目 **`fund-break-even-calculator`**
3. 点击进入该项目 → 顶部导航点击 **Settings**
4. 页面滚动到最底部 → 找到红色区域 **Delete Project**
5. 输入项目名 `fund-break-even-calculator` 确认删除

> 如果 Dashboard 里找不到该项目或已经删了，跳过此步。

---

## 第二步：导入正确仓库

1. 回到 [vercel.com](https://vercel.com) 首页
2. 点击 **Add New** → **Project**
3. 在 Git 仓库列表中找到 **`MriFox/fund-dashboard`**
   - 如果看不到，点击 **Adjust GitHub App Permissions** 授权仓库访问
4. 点击 **Import**

---

## 第三步：配置项目（⚠️ 关键）

在 Import 后的配置页面，**修改以下设置**：

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `fund-dashboard` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `fund-dashboard` |
| **Build Command** | `npm run build`（默认，不用改） |
| **Output Directory** | `dist`（默认，不用改） |

> ⚠️ **Root Directory 必须设为 `fund-dashboard`**！  
> 因为项目根目录还有 `api/` 目录，如果不设 Root Directory，Vite 会找不到 `index.html`。

其他选项保持默认，直接点 **Deploy**。

---

## 第四步：验证部署

部署成功后，Vercel 会显示一个域名，类似：

```
https://fund-dashboard-xxxxx.vercel.app
```

### 验证清单

在浏览器中访问以下地址：

| 地址 | 预期结果 |
|------|---------|
| `https://xxx.vercel.app/` | 看到 "基金看板 · 加载中…" 占位页面 |
| `https://xxx.vercel.app/api/fund/search?keyword=易方达` | 返回 JSON 搜索结果 |
| `https://xxx.vercel.app/api/fund/valuation?codes=110022` | 返回 JSON 估值数据 |
| `https://xxx.vercel.app/api/market/index` | 返回 JSON 大盘指数 |

### 如果部署失败

常见原因和解决：

| 错误 | 解决 |
|------|------|
| `Build failed: Could not find index.html` | Root Directory 没设为 `fund-dashboard`，去 Settings → General → Root Directory 修改后重新部署 |
| `Module not found: vue-tsc` | 等 Vercel 自动 install，重新触发部署（点 Redeploy） |
| API 404 | `vercel.json` 的 rewrites 已在项目中配置，确认 Root Directory 正确 |

### 如果 API 返回 500

检查 Vercel Dashboard → 项目 → **Functions** 标签，查看 Function 日志。

---

## 第五步：获取部署域名

部署成功后，把 `.vercel.app` 域名发回给 PM。后续 FD-005/006/007 页面开发完成后再次部署即可看到完整看板。

---

## 补充：Vercel CLI 方式（备用）

```bash
# 切换到项目目录
cd fund-dashboard

# 登录（打开浏览器授权）
npx vercel login

# 部署
npx vercel --prod
```

CLI 会自动检测 `vercel.json` 配置，无需手动设置 Root Directory。
