# 1602抽奖转盘 - 部署指南

## 快速部署

本应用是一个纯静态网站，可以部署到任何支持静态网站托管的平台。

### 部署前准备

1. **确保 Supabase 配置正确**
   - 检查 `supabase-config.js` 中的 `url` 和 `anonKey`
   - 确认数据库表已创建
   - 验证 RLS 策略已配置

2. **测试本地功能**
   ```bash
   python -m http.server 8000
   ```
   访问 http://localhost:8000 确认功能正常

## 部署选项

### 选项 1: GitHub Pages（推荐）

**优点**: 免费、简单、自动部署

**步骤**:
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 Pages
3. 选择源分支（main）
4. 等待部署完成

**自动部署**: 已配置 GitHub Actions，推送代码后自动部署

**访问地址**: `https://your-username.github.io/repository-name`

### 选项 2: Netlify

**优点**: 功能丰富、CDN 加速、表单处理

**步骤**:
1. 注册 Netlify 账号
2. 连接 GitHub 仓库
3. 部署设置：
   - Build command: `echo 'No build needed'`
   - Publish directory: `.`
4. 点击部署

**配置文件**: `netlify.toml` 已配置

### 选项 3: Vercel

**优点**: 快速、全球 CDN、零配置

**步骤**:
1. 注册 Vercel 账号
2. 导入 GitHub 仓库
3. 使用默认设置部署

**配置文件**: `vercel.json` 已配置

### 选项 4: Firebase Hosting

**优点**: Google 服务、高性能

**步骤**:
1. 安装 Firebase CLI: `npm install -g firebase-tools`
2. 登录: `firebase login`
3. 初始化: `firebase init hosting`
4. 部署: `firebase deploy`

## 环境配置

### Supabase 配置

确保 `supabase-config.js` 包含正确的配置：

```javascript
window.SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here',
    // ... 其他配置
};
```

### 域名配置（可选）

如果使用自定义域名：
1. 在部署平台添加自定义域名
2. 配置 DNS 记录
3. 启用 HTTPS

## 部署后验证

### 功能测试清单

- [ ] 主页正常加载
- [ ] 用户注册功能
- [ ] 抽奖轮盘转动
- [ ] 管理后台访问 (`/admin`)
- [ ] 数据库连接正常
- [ ] 移动端适配

### 性能检查

- [ ] 页面加载速度 < 3秒
- [ ] 图片优化
- [ ] CDN 缓存配置
- [ ] GZIP 压缩启用

## 常见问题

### 1. 页面空白
**原因**: JavaScript 错误或文件路径问题
**解决**: 检查浏览器控制台，确认所有文件正确加载

### 2. Supabase 连接失败
**原因**: 配置错误或 CORS 问题
**解决**: 
- 检查 URL 和 API Key
- 确认 Supabase 项目状态
- 检查 RLS 策略

### 3. 管理后台无法访问
**原因**: 路由配置问题
**解决**: 确认部署平台支持 SPA 路由重定向

### 4. 移动端显示异常
**原因**: CSS 兼容性问题
**解决**: 测试不同设备和浏览器

## 安全配置

### Content Security Policy
已在 `netlify.toml` 和 `vercel.json` 中配置 CSP 头部

### HTTPS
所有推荐的部署平台都默认启用 HTTPS

### 环境变量
敏感信息应通过环境变量配置，避免硬编码

## 监控和维护

### 错误监控
建议集成错误监控服务：
- Sentry
- LogRocket
- Bugsnag

### 性能监控
- Google Analytics
- Google PageSpeed Insights
- GTmetrix

### 备份策略
- 定期备份 Supabase 数据
- 代码版本控制
- 配置文件备份

## 更新部署

### 自动部署
推送代码到主分支后自动触发部署

### 手动部署
根据选择的平台，使用相应的部署命令

### 回滚
如果部署出现问题，可以快速回滚到上一个版本

---

## 技术支持

如果遇到部署问题，请检查：
1. 部署日志
2. 浏览器控制台
3. Supabase 项目状态
4. 网络连接

完成部署后，您的抽奖转盘应用就可以通过 URL 访问了！