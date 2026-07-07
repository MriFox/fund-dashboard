# iOS 设计风格补丁

> 适用于 FD-005/006/007 所有页面开发

## 全局 CSS 变量（在 App.vue 或全局样式注入）

```css
:root {
  --color-up: #ee3b3b;          /* iOS 红 */
  --color-down: #34c759;         /* iOS 绿 */
  --bg-primary: #f2f2f7;         /* iOS 系统背景灰 */
  --bg-card: #ffffff;            /* 卡片白 */
  --text-primary: #1c1c1e;       /* iOS 主文字 */
  --text-secondary: #8e8e93;     /* iOS 副文字 */
  --separator: #e5e5ea;          /* iOS 分割线 */
  --radius-card: 12px;           /* iOS 卡片圆角 */
  --radius-button: 10px;         /* iOS 按钮圆角 */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08);
  --font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}
```

## 组件视觉规范

| 组件 | iOS 调整 |
|------|---------|
| **AppShell** | 背景色改为 `#f2f2f7`（iOS 系统灰） |
| **NavBar** | 半透明毛玻璃效果：`bg-white/80 backdrop-blur-lg`，去掉底部阴影，改用顶部分割线 |
| **FundCard** | 圆角 `rounded-xl`(12px)，轻阴影 `shadow-sm`，白色背景，列表间距 8px |
| **PageHeader** | 大标题样式：`text-lg font-bold`（iOS 大标题），背景半透明 |
| **ProfitBadge** | 涨跌数字加粗，使用 SF Mono 数字 |
| **SkeletonLoader** | 圆角 8px，浅灰 `#e5e5ea` |
| **按钮** | 圆角 10px，系统蓝色 `#007aff`，高度 44px（iOS 最小触控） |
| **输入框** | 圆角 10px，灰色背景 `#f2f2f7`，无边框，高度 44px |
| **弹窗/底部菜单** | 从底部滑入，顶部圆角 16px，白色背景 + 毛玻璃遮罩 |

## 间距规范

```
组件间间距：12px
区块间间距：20px
页面水平边距：16px
列表项内边距：16px
```

## 字体

```
大标题：font-size: 22px, font-weight: 700
标题：font-size: 17px, font-weight: 600  
正文：font-size: 15px, font-weight: 400
辅助文字：font-size: 13px, font-weight: 400, color: #8e8e93
数字（金额/涨跌）：font-size: 15px, font-weight: 600, tabular-nums
```

## 交互

- 点击态：`active:bg-black/5`（iOS 按下灰色高亮）
- 过渡：`transition-all duration-200 ease-out`
- 页面切换：不需要动画（FD-005~007 直接用 router-view）
- 列表为空时：显示 SF Symbol 风格的图标 + 灰色提示文字
