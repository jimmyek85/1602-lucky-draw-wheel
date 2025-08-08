# 🎯 1602幸运轮盘项目启动指南

## 📋 项目概述

这是一个基于Supabase云数据库的幸运轮盘抽奖系统，包含：
- **前端客户页面** (`index.html`) - 用户注册和抽奖
- **后端管理页面** (`admin.html`) - 用户管理和数据分析
- **实时数据同步** - 前后端数据完全连通

## 🚀 快速启动步骤

### 第一步：启动本地服务器

项目已经启动在本地服务器上：
- **服务器地址**: http://localhost:8000
- **主页面**: http://localhost:8000/index.html
- **管理页面**: http://localhost:8000/admin.html
- **连接测试**: http://localhost:8000/simple-connection-test.html

### 第二步：配置Supabase数据库

#### 2.1 检查当前配置
当前Supabase配置：
```javascript
SUPABASE_URL: 'https://rlwuwjegxgtsdshnhyrr.supabase.co'
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsd3V3amVneGd0c2RzaG5oeXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzA0NzAsImV4cCI6MjA3MDE0NjQ3MH0.4m5iS5wGtMfNiWTfX4j8PtKyP0IUYJztVtFE4xGsXLk'
```

#### 2.2 数据库设置
1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 登录并选择项目
3. 进入 **SQL Editor**
4. 执行 `supabase-complete-setup.sql` 脚本

### 第三步：测试连接

访问连接测试页面：http://localhost:8000/simple-connection-test.html

点击"🚀 开始测试"按钮，检查：
- ✅ 配置文件加载
- ✅ Supabase客户端初始化
- ✅ 数据库连接
- ✅ 表结构验证

## 📁 项目文件结构

### 核心页面
- `index.html` - 客户端主页面（用户注册、抽奖）
- `admin.html` - 管理员后台（用户管理、数据分析）

### 配置文件
- `supabase-config.js` - Supabase数据库配置
- `config.js` - API配置（Gemini AI）
- `supabase-complete-setup.sql` - 数据库初始化脚本

### 连接管理
- `supabase-connection.js` - 数据连接管理器
- `fix-connection.js` - 连接问题修复工具

### 测试和修复工具
- `simple-connection-test.html` - 简化连接测试
- `connection-fix-solution.html` - 连接修复方案
- `check-database-setup.html` - 数据库设置检查

## 🔧 功能特性

### 前端功能 (index.html)
- 🎯 幸运轮盘抽奖
- 👤 用户注册系统
- 🌐 多语言支持（中英文）
- 🎁 奖品展示和兑换
- 🤖 AI啤酒推荐

### 后端功能 (admin.html)
- 📊 用户数据管理
- 📢 活动公告发布
- 🧠 AI知识库管理
- 📈 数据统计分析
- 🔄 实时数据同步

## 🛠️ 故障排除

### 常见问题

#### 1. Supabase连接失败
**症状**: `net::ERR_NAME_NOT_RESOLVED` 错误
**解决方案**:
1. 检查网络连接
2. 验证Supabase URL和API Key
3. 使用连接测试页面诊断

#### 2. 数据无法保存
**症状**: 用户注册后数据不显示
**解决方案**:
1. 确认数据库表已创建
2. 检查RLS策略配置
3. 运行SQL设置脚本

#### 3. 前后端数据不同步
**症状**: 管理页面看不到用户数据
**解决方案**:
1. 检查实时订阅配置
2. 刷新页面重新连接
3. 使用连接修复工具

### 修复工具

1. **简化连接测试**: http://localhost:8000/simple-connection-test.html
2. **连接修复方案**: http://localhost:8000/connection-fix-solution.html
3. **数据库设置检查**: http://localhost:8000/check-database-setup.html

## 📱 使用流程

### 用户端流程
1. 访问 http://localhost:8000
2. 点击"Enter Now"进入注册
3. 填写个人信息
4. 获得免费抽奖机会
5. 转动幸运轮盘
6. 查看中奖结果

### 管理端流程
1. 访问 http://localhost:8000/admin.html
2. 查看用户管理面板
3. 发布活动公告
4. 管理AI知识库
5. 分析用户数据

## 🔐 安全配置

- ✅ Supabase RLS (Row Level Security) 已配置
- ✅ API密钥安全存储
- ✅ 用户数据加密传输
- ✅ 防止SQL注入攻击

## 📞 技术支持

如果遇到问题，请：
1. 首先使用项目内置的测试和修复工具
2. 查看浏览器控制台错误信息
3. 检查Supabase Dashboard中的日志
4. 参考项目文档和指南

---

**项目状态**: ✅ 已启动并运行在 http://localhost:8000
**数据库**: ✅ Supabase连接已配置并正常工作
**建议**: 可以开始使用完整功能，包括用户注册和数据管理