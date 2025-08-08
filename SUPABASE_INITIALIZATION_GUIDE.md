# 1602 幸运轮盘 - Supabase 完整初始化指南

## 🎯 概述

本指南将帮助您完成 Supabase 数据库的完整初始化设置，解决当前的连接错误，并提供完整的项目操作流程。

## ⚠️ 当前问题分析

根据错误日志分析，当前存在以下问题：
- `net::ERR_NAME_NOT_RESOLVED` 错误
- Supabase URL: `https://ibirsieaeozhsvleegri.supabase.co` 无法解析
- 数据库连接失败，导致所有功能无法正常使用

## 🔧 解决方案：完整 Supabase 初始化

### 第一步：登录 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 使用您的账户登录
3. 选择您的项目或创建新项目

### 第二步：执行数据库初始化脚本

#### 2.1 打开 SQL Editor

1. 在 Supabase Dashboard 中，点击左侧菜单的 **"SQL Editor"**
2. 点击 **"New Query"** 创建新查询

#### 2.2 执行完整设置脚本

1. 复制 `supabase-complete-setup.sql` 文件的全部内容
2. 粘贴到 SQL Editor 中
3. 点击 **"Run"** 按钮执行脚本

#### 2.3 验证执行结果

执行成功后，您应该看到以下消息：
```
✅ 所有表创建成功
✅ RLS策略配置成功
✅ 实时订阅配置成功
🎉 1602 幸运轮盘应用数据库设置完成！
```

### 第三步：获取正确的连接信息

#### 3.1 获取项目 URL 和 API Key

1. 在 Supabase Dashboard 中，点击左侧的 **"Settings"**
2. 选择 **"API"** 选项卡
3. 复制以下信息：
   - **Project URL** (格式：`https://your-project-id.supabase.co`)
   - **anon public** API Key

#### 3.2 更新本地配置文件

编辑 `supabase-config.js` 文件，更新为正确的配置：

```javascript
// Supabase 配置
const SUPABASE_CONFIG = {
    url: 'https://your-actual-project-id.supabase.co', // 替换为您的实际 URL
    anonKey: 'your-actual-anon-key' // 替换为您的实际 anon key
};
```

### 第四步：验证数据库设置

#### 4.1 检查表结构

在 SQL Editor 中执行以下查询验证表是否创建成功：

```sql
-- 检查所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'settings', 'knowledge');

-- 检查用户表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 检查初始数据
SELECT key, description FROM settings;
SELECT key, title FROM knowledge;
```

#### 4.2 测试数据操作

```sql
-- 插入测试用户
INSERT INTO users (name, phone, email, address) 
VALUES ('测试用户', '+60123456789', 'test@example.com', '测试地址');

-- 查询测试用户
SELECT * FROM users WHERE phone = '+60123456789';

-- 删除测试用户
DELETE FROM users WHERE phone = '+60123456789';
```

## 🚀 完整项目操作流程

### 1. 项目启动流程

#### 1.1 启动本地服务器
```bash
# 在项目目录中执行
python -m http.server 8000
```

#### 1.2 访问应用
- **主页面**：http://localhost:8000/index.html
- **管理后台**：http://localhost:8000/admin.html
- **连接测试**：http://localhost:8000/simple-connection-test.html

### 2. 用户端操作流程

#### 2.1 用户注册流程
1. 访问主页面 (`index.html`)
2. 选择语言（中文/英文）
3. 扫描二维码或点击"快速通道"
4. 填写个人信息：
   - 姓名（必填）
   - 手机号（必填，唯一）
   - 邮箱（可选）
   - 地址（可选）
5. 提交注册

#### 2.2 抽奖流程
1. 注册成功后自动跳转到抽奖页面
2. 点击"开始抽奖"按钮
3. 轮盘旋转并显示结果
4. 查看中奖信息和奖品详情
5. 获取 AI 啤酒推荐

### 3. 管理员操作流程

#### 3.1 用户管理
1. 访问管理后台 (`admin.html`)
2. 在"用户管理"标签页中：
   - 查看所有注册用户
   - 搜索特定用户
   - 查看用户详细信息
   - 编辑用户数据
   - 删除用户记录

#### 3.2 公告管理
1. 切换到"公告管理"标签页
2. 编辑公告内容
3. 发布公告到客户端
4. 查看公告历史

#### 3.3 AI 知识库管理
1. 切换到"AI 知识库"标签页
2. 输入品牌信息和产品知识
3. 更新 AI 推荐算法数据
4. 管理知识库分类和标签

### 4. 数据库管理流程

#### 4.1 日常维护
```sql
-- 查看用户统计
SELECT * FROM user_statistics;

-- 备份用户数据
SELECT * FROM backup_user_data();

-- 清理测试数据
SELECT cleanup_test_data();
```

#### 4.2 数据分析
```sql
-- 参与度分析
SELECT 
    DATE(created_at) as date,
    COUNT(*) as registrations,
    SUM(participation_count) as total_participations
FROM users 
GROUP BY DATE(created_at) 
ORDER BY date DESC;

-- 奖品分布分析
SELECT 
    jsonb_array_length(prizeswon) as prize_count,
    COUNT(*) as user_count
FROM users 
WHERE jsonb_array_length(prizeswon) > 0
GROUP BY jsonb_array_length(prizeswon);
```

## 🔍 故障排除

### 常见问题及解决方案

#### 1. 连接错误 (ERR_NAME_NOT_RESOLVED)
**原因**：Supabase URL 不正确或项目不存在
**解决**：
1. 检查 Supabase Dashboard 中的项目状态
2. 确认项目 URL 格式正确
3. 重新获取 API Key
4. 更新 `supabase-config.js` 配置

#### 2. 权限错误 (RLS Policy)
**原因**：行级安全策略配置问题
**解决**：
```sql
-- 重新设置 RLS 策略
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);
```

#### 3. 实时订阅失败
**原因**：实时功能未正确配置
**解决**：
```sql
-- 重新启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge;
```

## 📊 监控和维护

### 1. 性能监控
- 定期检查数据库查询性能
- 监控用户注册和参与趋势
- 分析系统资源使用情况

### 2. 数据备份
- 每日自动备份用户数据
- 定期导出重要配置
- 保留历史数据快照

### 3. 安全维护
- 定期更新 API Key
- 检查访问日志
- 监控异常活动

## 🎉 完成确认

完成所有步骤后，您应该能够：

✅ 成功连接到 Supabase 数据库  
✅ 用户可以正常注册和参与抽奖  
✅ 管理员可以查看和管理用户数据  
✅ AI 功能正常工作  
✅ 实时数据同步正常  

## 📞 技术支持

如果在初始化过程中遇到问题，请：

1. 检查 Supabase Dashboard 中的项目状态
2. 查看浏览器控制台的详细错误信息
3. 确认网络连接正常
4. 验证 API Key 和权限设置

---

**注意**：请确保在生产环境中使用强密码和适当的安全策略。本指南提供的配置适用于开发和测试环境。