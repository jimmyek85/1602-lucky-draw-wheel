# Netlify 部署指南

## 📋 部署前准备

### 1. 项目文件检查
确保以下文件已正确配置：

#### 必需文件：
- ✅ `index.html` - 主页面
- ✅ `netlify.toml` - Netlify 配置文件
- ✅ `package.json` - 项目配置
- ✅ `config.js` - API 配置
- ✅ `supabase-config.js` - 数据库配置
- ✅ `offline-storage-manager.js` - 离线存储管理
- ✅ `github-backup-manager.js` - 备份管理
- ✅ `backup-dashboard.html` - 备份管理面板

#### 支持文件：
- ✅ `admin.html` - 管理面板
- ✅ `supabase-connection.js` - 数据库连接
- ✅ `fix-connection.js` - 连接修复
- ✅ 其他调试和测试文件

### 2. 环境变量配置

#### Supabase 配置（必需）
在 `supabase-config.js` 中确保以下配置正确：
```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-supabase-anon-key'
};
```

#### API 配置（可选）
在 `config.js` 中配置 Gemini API（如需 AI 功能）：
```javascript
const API_CONFIG = {
    GEMINI_API_KEY: 'your-gemini-api-key'
};
```

## 🚀 Netlify 部署步骤

### 方法一：GitHub 连接部署（推荐）

1. **准备 GitHub 仓库**
   ```bash
   # 如果还没有推送到 GitHub
   git add .
   git commit -m "准备 Netlify 部署"
   git push origin main
   ```

2. **登录 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 使用 GitHub 账号登录

3. **创建新站点**
   - 点击 "New site from Git"
   - 选择 "GitHub"
   - 选择您的项目仓库

4. **配置构建设置**
   - **Branch to deploy**: `main`
   - **Build command**: `echo 'No build command needed'`
   - **Publish directory**: `.`（根目录）

5. **环境变量设置**
   - 进入 Site settings → Environment variables
   - 添加以下变量（如果需要）：
     ```
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_ANON_KEY=your-supabase-anon-key
     GEMINI_API_KEY=your-gemini-api-key
     ```

6. **部署**
   - 点击 "Deploy site"
   - 等待部署完成

### 方法二：手动文件上传

1. **准备部署文件**
   - 确保所有文件都在项目根目录
   - 检查配置文件中的密钥已正确设置

2. **创建部署包**
   需要上传的文件列表：
   ```
   ├── index.html
   ├── admin.html
   ├── backup-dashboard.html
   ├── config.js
   ├── supabase-config.js
   ├── supabase-connection.js
   ├── offline-storage-manager.js
   ├── github-backup-manager.js
   ├── fix-connection.js
   ├── ai-features.js
   ├── netlify.toml
   ├── package.json
   ├── favicon.ico
   └── 所有其他 .html 和 .js 文件
   ```

3. **手动部署**
   - 登录 Netlify
   - 点击 "Sites" → "Add new site" → "Deploy manually"
   - 拖拽整个项目文件夹到部署区域

## ⚙️ Netlify 配置说明

### netlify.toml 配置解析

```toml
[build]
  publish = "."                    # 发布根目录
  command = "echo 'No build command needed'"  # 无需构建命令

# 重定向配置
[[redirects]]
  from = "/admin"
  to = "/admin.html"
  status = 200

# 安全头部
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "..."
    X-Frame-Options = "DENY"
```

### 重要配置项：
- **发布目录**: 根目录 (`.`)
- **构建命令**: 无需构建（静态站点）
- **重定向**: 支持 `/admin` → `/admin.html`
- **安全头部**: CSP、XSS 保护等
- **缓存**: JS 文件缓存 1 年

## 🔧 部署后配置

### 1. 域名设置
- 在 Netlify 控制台设置自定义域名
- 配置 DNS 记录
- 启用 HTTPS（自动）

### 2. 功能测试
- ✅ 主页加载正常
- ✅ 用户注册功能
- ✅ 转盘抽奖功能
- ✅ 管理面板访问
- ✅ 离线模式工作
- ✅ 数据同步功能
- ✅ 备份管理面板

### 3. 性能优化
- 启用 Netlify 的资源压缩
- 配置 CDN 缓存
- 监控站点性能

## 🔍 故障排除

### 常见问题：

1. **Supabase 连接失败**
   - 检查 `supabase-config.js` 中的 URL 和密钥
   - 确认 Supabase 项目状态
   - 查看浏览器控制台错误

2. **页面 404 错误**
   - 检查 `netlify.toml` 重定向配置
   - 确认文件路径正确

3. **功能不工作**
   - 检查浏览器控制台错误
   - 验证 API 密钥配置
   - 测试网络连接

4. **离线模式问题**
   - 检查 IndexedDB 支持
   - 验证离线存储管理器初始化

## 📱 移动端优化

项目已包含响应式设计：
- ✅ 移动端适配
- ✅ 触摸操作支持
- ✅ 离线功能支持

## 🔐 安全配置

已配置的安全措施：
- ✅ CSP 内容安全策略
- ✅ XSS 保护
- ✅ 点击劫持保护
- ✅ HTTPS 强制

## 📊 监控和分析

建议启用：
- Netlify Analytics（流量分析）
- 错误监控
- 性能监控

## 🎯 部署清单

部署前检查：
- [ ] 所有配置文件已更新
- [ ] Supabase 连接已测试
- [ ] API 密钥已配置（如需要）
- [ ] 本地测试通过
- [ ] 文件权限正确

部署后验证：
- [ ] 网站可正常访问
- [ ] 所有功能正常工作
- [ ] 移动端显示正常
- [ ] 离线模式可用
- [ ] 管理面板可访问

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查 Netlify 部署日志
2. 查看浏览器控制台错误
3. 使用项目中的调试工具：
   - `/debug` - 连接调试
   - `/test` - 简单连接测试
   - `/backup-dashboard.html` - 备份状态

**部署成功后，您的幸运转盘项目将具备完整的离线存储、自动同步和备份功能！** 🎉