# 部署检查清单

## 部署前检查

### 1. Supabase 配置检查
- [ ] 确认 `supabase-config.js` 中的 `url` 和 `anonKey` 已正确配置
- [ ] 确认 Supabase 项目已创建并运行
- [ ] 确认数据库表已创建（users, settings, knowledge）
- [ ] 确认 RLS 策略已配置

### 2. 文件完整性检查
- [ ] `index.html` - 主页面
- [ ] `admin.html` - 管理后台
- [ ] `supabase-config.js` - Supabase 配置
- [ ] `supabase-connection.js` - 连接管理
- [ ] `config.js` - 应用配置
- [ ] `ai-features.js` - AI 功能
- [ ] `favicon.ico` - 网站图标

### 3. 部署配置文件
- [ ] `netlify.toml` - Netlify 部署配置
- [ ] `vercel.json` - Vercel 部署配置
- [ ] `package.json` - 项目依赖（如需要）

### 4. 功能测试
- [ ] 用户注册功能
- [ ] 抽奖轮盘功能
- [ ] 管理后台登录
- [ ] 数据导出功能
- [ ] AI 功能（如启用）

## 部署选项

### 选项 1: Netlify 部署
1. 将代码推送到 GitHub 仓库
2. 连接 Netlify 到 GitHub 仓库
3. 设置构建命令：`echo 'No build needed'`
4. 设置发布目录：`.`
5. 部署

### 选项 2: Vercel 部署
1. 将代码推送到 GitHub 仓库
2. 连接 Vercel 到 GitHub 仓库
3. 使用默认设置部署

### 选项 3: GitHub Pages
1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择源分支（通常是 main）

## 部署后验证

### 1. 基本功能测试
- [ ] 访问主页面
- [ ] 测试用户注册
- [ ] 测试抽奖功能
- [ ] 访问管理后台

### 2. 数据库连接测试
- [ ] 用户数据能正常保存
- [ ] 管理后台能显示用户列表
- [ ] 数据导出功能正常

### 3. 性能检查
- [ ] 页面加载速度
- [ ] 移动端适配
- [ ] 跨浏览器兼容性

## 常见问题解决

### Supabase 连接问题
- 检查 URL 和 API Key 是否正确
- 确认 RLS 策略允许匿名访问
- 检查 CORS 设置

### 部署后页面空白
- 检查浏览器控制台错误
- 确认所有文件路径正确
- 检查 CSP 策略设置

### 功能异常
- 检查 JavaScript 错误
- 确认 API 调用正常
- 验证数据库权限设置

## 环境变量配置（如需要）

对于某些部署平台，可能需要设置环境变量：

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key (可选)
```

## 安全检查

- [ ] 确认没有硬编码敏感信息
- [ ] 检查 RLS 策略正确配置
- [ ] 验证 CORS 设置
- [ ] 确认 CSP 头部配置

## 监控和维护

- [ ] 设置错误监控
- [ ] 配置性能监控
- [ ] 定期备份数据库
- [ ] 监控 API 使用量

---

完成所有检查项后，应用即可成功部署并正常运行。