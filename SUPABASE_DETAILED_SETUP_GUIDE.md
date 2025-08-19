# 🗄️ Supabase 详细设置指南

## 📋 目录
1. [创建 Supabase 账户和项目](#1-创建-supabase-账户和项目)
2. [获取项目配置信息](#2-获取项目配置信息)
3. [执行 SQL 设置脚本](#3-执行-sql-设置脚本)
4. [验证数据库设置](#4-验证数据库设置)
5. [配置实时功能](#5-配置实时功能)
6. [更新应用配置](#6-更新应用配置)
7. [测试连接](#7-测试连接)
8. [常见问题解决](#8-常见问题解决)

---

## 1. 创建 Supabase 账户和项目

### 步骤 1.1：注册 Supabase 账户
1. 访问 [Supabase 官网](https://app.supabase.com/)
2. 点击 "Start your project" 或 "Sign up"
3. 选择注册方式：
   - GitHub 账户（推荐）
   - Google 账户
   - 邮箱注册

### 步骤 1.2：创建新项目
1. 登录后，点击 "New project"
2. 选择或创建组织（Organization）
3. 填写项目信息：
   ```
   项目名称: 1602-lucky-wheel
   数据库密码: [设置一个强密码，请记住此密码]
   地区: Southeast Asia (Singapore) [选择离您最近的地区]
   定价计划: Free tier [免费版本]
   ```
4. 点击 "Create new project"
5. 等待项目创建完成（通常需要 1-2 分钟）

---

## 2. 获取项目配置信息

### 步骤 2.1：获取 Project URL
1. 在项目仪表板中，点击左侧菜单的 "Settings"
2. 选择 "API" 选项卡
3. 在 "Project URL" 部分，复制 URL
   ```
   格式: https://your-project-id.supabase.co
   示例: https://abcdefghijklmnop.supabase.co
   ```

### 步骤 2.2：获取 API Keys
1. 在同一个 "API" 页面中
2. 找到 "Project API keys" 部分
3. 复制 "anon public" key（这是我们需要的密钥）
   ```
   格式: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   注意: 这个密钥很长，请完整复制
   ```

### 步骤 2.3：保存配置信息
创建一个临时文件保存这些信息：
```
项目名称: 1602-lucky-wheel
Project URL: https://your-project-id.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
数据库密码: [您设置的密码]
```

---

## 3. 执行 SQL 设置脚本

### 步骤 3.1：打开 SQL Editor
1. 在 Supabase 项目仪表板中
2. 点击左侧菜单的 "SQL Editor"
3. 您会看到一个 SQL 查询编辑器

### 步骤 3.2：执行完整设置脚本
1. 点击 "New query" 创建新查询
2. 复制 `supabase-complete-setup.sql` 文件的完整内容
3. 粘贴到 SQL 编辑器中
4. 点击 "Run" 按钮执行脚本

### 步骤 3.3：验证脚本执行结果
执行成功后，您应该看到类似以下的输出：
```
✅ 所有数据表创建成功
✅ RLS 策略配置成功
✅ 实时订阅配置成功
✅ 初始数据插入完成：设置项 20 个，知识库条目 8 个
🎉 ===== 1602 幸运轮盘数据库设置完成 =====
```

### 步骤 3.4：处理可能的错误
如果遇到错误：
1. **权限错误**: 确保您是项目的所有者
2. **语法错误**: 检查 SQL 脚本是否完整复制
3. **连接错误**: 刷新页面重试

---

## 4. 验证数据库设置

### 步骤 4.1：检查表结构
1. 在 SQL Editor 中执行以下查询：
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
2. 应该看到三个表：`knowledge`, `settings`, `users`

### 步骤 4.2：检查初始数据
1. 检查设置数据：
   ```sql
   SELECT key, value, description 
   FROM settings 
   ORDER BY key;
   ```
2. 检查知识库数据：
   ```sql
   SELECT category, title 
   FROM knowledge 
   ORDER BY sort_order;
   ```

### 步骤 4.3：测试函数
1. 测试用户统计函数：
   ```sql
   SELECT * FROM get_user_stats();
   ```
2. 应该返回初始统计信息（全部为 0）

---

## 5. 配置实时功能

### 步骤 5.1：启用实时订阅
1. 点击左侧菜单的 "Database"
2. 选择 "Replication" 选项卡
3. 确保以下表已添加到 "supabase_realtime" publication：
   - `users`
   - `settings`
   - `knowledge`

### 步骤 5.2：手动添加表（如果需要）
如果表没有自动添加，执行以下 SQL：
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge;
```

---

## 6. 更新应用配置

### 步骤 6.1：更新 supabase-config.js
1. 打开项目中的 `supabase-config.js` 文件
2. 更新配置信息：
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://your-project-id.supabase.co', // 替换为您的 Project URL
       anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // 替换为您的 Anon Key
       TABLES: {
           USERS: 'users',
           SETTINGS: 'settings',
           KNOWLEDGE: 'knowledge'
       },
       REALTIME_CONFIG: {
           enabled: true,
           reconnectInterval: 5000,
           maxReconnectAttempts: 10
       }
   };
   ```

### 步骤 6.2：更新 cloud-deployment-config.js
1. 打开 `cloud-deployment-config.js` 文件
2. 更新 API_BASE_URL：
   ```javascript
   const CLOUD_DEPLOYMENT_CONFIG = {
       PRODUCTION: {
           API_BASE_URL: 'https://your-project-id.supabase.co', // 替换为您的 Project URL
           // ... 其他配置
       },
       DEVELOPMENT: {
           API_BASE_URL: 'https://your-project-id.supabase.co', // 替换为您的 Project URL
           // ... 其他配置
       }
   };
   ```

---

## 7. 测试连接

### 步骤 7.1：本地测试
1. 启动本地服务器：
   ```bash
   python -m http.server 8000
   ```
2. 访问测试页面：
   - 主页: http://localhost:8000
   - 管理页面: http://localhost:8000/admin.html
   - 连接测试: http://localhost:8000/frontend-backend-connection-test.html

### 步骤 7.2：验证功能
1. **用户注册测试**：
   - 在主页填写用户信息
   - 检查是否能成功保存到数据库

2. **实时同步测试**：
   - 同时打开主页和管理页面
   - 在主页添加用户，观察管理页面是否实时更新

3. **设置更新测试**：
   - 在管理页面修改公告
   - 检查主页是否实时显示新公告

### 步骤 7.3：检查浏览器控制台
1. 按 F12 打开开发者工具
2. 查看 Console 标签页
3. 确认没有连接错误或 JavaScript 错误

---

## 8. 常见问题解决

### 问题 8.1：连接失败
**症状**: 页面显示 "Supabase 连接失败"

**解决方案**:
1. 检查 Project URL 和 Anon Key 是否正确
2. 确认网络连接正常
3. 检查 Supabase 项目状态是否正常
4. 验证 RLS 策略是否正确配置

### 问题 8.2：实时同步不工作
**症状**: 数据更新后其他页面不自动刷新

**解决方案**:
1. 检查表是否添加到 realtime publication
2. 确认浏览器支持 WebSocket
3. 检查防火墙设置
4. 重新执行实时配置 SQL

### 问题 8.3：权限错误
**症状**: 无法读取或写入数据

**解决方案**:
1. 检查 RLS 策略配置
2. 确认用户角色权限
3. 重新执行权限设置 SQL

### 问题 8.4：数据插入失败
**症状**: 用户注册时出现错误

**解决方案**:
1. 检查表结构是否正确
2. 验证必填字段是否都有值
3. 检查数据类型是否匹配
4. 查看 Supabase 日志获取详细错误信息

---

## 🎯 部署检查清单

在部署到生产环境前，请确认以下项目：

- [ ] ✅ Supabase 项目创建成功
- [ ] ✅ SQL 脚本执行无错误
- [ ] ✅ 三个数据表创建完成
- [ ] ✅ RLS 策略配置正确
- [ ] ✅ 实时订阅启用成功
- [ ] ✅ 初始数据插入完成
- [ ] ✅ 应用配置文件更新
- [ ] ✅ 本地连接测试通过
- [ ] ✅ 用户注册功能正常
- [ ] ✅ 实时同步功能正常
- [ ] ✅ 管理功能正常
- [ ] ✅ 无浏览器控制台错误

---

## 📞 技术支持

如果您在设置过程中遇到问题：

1. **查看 Supabase 文档**: https://supabase.com/docs
2. **检查项目日志**: Supabase Dashboard > Logs
3. **社区支持**: https://github.com/supabase/supabase/discussions
4. **官方 Discord**: https://discord.supabase.com/

---

## 🚀 下一步

完成 Supabase 设置后，您可以：

1. 📖 阅读 [云部署指南](./CLOUD_DEPLOYMENT_GUIDE.md)
2. 🧪 使用 [快速部署工具](./quick-deploy.html)
3. ✅ 运行 [部署验证](./deployment-verification.html)
4. 🔗 测试 [前后端连接](./frontend-backend-connection-test.html)

**恭喜！您的 1602 幸运轮盘应用数据库已经配置完成！** 🎉