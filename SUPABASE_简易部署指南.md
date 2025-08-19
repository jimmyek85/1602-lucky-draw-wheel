# 🚀 Supabase 简易部署指南

## 📝 快速开始（5分钟完成）

### 第一步：创建 Supabase 账户
1. 访问：https://app.supabase.com/
2. 点击 "Sign up" 注册（建议用 GitHub 账户）
3. 创建新项目：
   - 项目名：`1602-lucky-wheel`
   - 密码：设置一个强密码（请记住）
   - 地区：选择 `Southeast Asia (Singapore)`
   - 点击 "Create new project"

### 第二步：获取配置信息
1. 项目创建完成后，点击左侧 "Settings" → "API"
2. 复制以下两个重要信息：
   ```
   Project URL: https://xxxxxxxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 第三步：执行数据库设置
1. 点击左侧 "SQL Editor"
2. 点击 "New query"
3. **复制 `supabase-complete-setup.sql` 文件的全部内容**
4. 粘贴到编辑器中
5. 点击 "Run" 执行
6. 等待看到成功消息："🎉 1602 幸运轮盘数据库设置完成"

### 第四步：更新项目配置
1. 打开项目中的 `supabase-config.js` 文件
2. 替换以下两行：
   ```javascript
   url: 'https://xxxxxxxxxx.supabase.co',  // 替换为您的 Project URL
   anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // 替换为您的 anon public key
   ```

### 第五步：测试连接
1. 启动本地服务器：`python -m http.server 8000`
2. 访问：http://localhost:8000/frontend-backend-connection-test.html
3. 点击 "测试 Supabase 连接"，确保所有项目都显示 ✅

## 🌐 部署到云服务器

### 使用 Vercel（推荐）
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel
```

### 使用 Netlify
1. 访问 https://netlify.com
2. 拖拽项目文件夹到页面
3. 等待部署完成

## ✅ 验证部署
访问您的部署地址：
- 前端：`https://your-app.vercel.app`
- 管理后台：`https://your-app.vercel.app/admin`
- 测试页面：`https://your-app.vercel.app/deployment-verification.html`

## 🔧 常见问题

**Q: 连接失败怎么办？**
A: 检查 URL 和 Key 是否正确复制，确保没有多余的空格

**Q: 实时同步不工作？**
A: 在 Supabase Dashboard → Database → Replication 中确保表已添加到 realtime

**Q: 权限错误？**
A: 重新执行 SQL 脚本，确保 RLS 策略正确设置

---

**🎉 完成！您的 1602 幸运轮盘应用现已成功部署并联网运行！**