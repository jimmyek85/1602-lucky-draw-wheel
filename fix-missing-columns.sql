-- =====================================================
-- 修复 users 表缺失列的 SQL 脚本
-- 请在 Supabase Dashboard > SQL Editor 中执行
-- =====================================================

-- 注意：执行前请备份数据库！
-- 这些 SQL 语句将添加可能缺失的列到 users 表

-- 1. 添加 joindate 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS joindate TIMESTAMPTZ DEFAULT NOW();

-- 2. 添加 participation_count 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS participation_count INTEGER DEFAULT 1;

-- 3. 添加 last_participation 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_participation TIMESTAMPTZ DEFAULT NOW();

-- 4. 添加 drawchances 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS drawchances INTEGER DEFAULT 1;

-- 5. 添加 prizeswon 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS prizeswon JSONB DEFAULT '[]'::jsonb;

-- 6. 添加 status 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 7. 添加 notes 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT;

-- 8. 添加 referral_code 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- 9. 添加 referred_by 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- 10. 添加 created_at 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 11. 添加 updated_at 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 12. 添加 address 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- 13. 添加 email 列（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- =====================================================
-- 创建索引以提高查询性能
-- =====================================================

-- 为 joindate 创建索引
CREATE INDEX IF NOT EXISTS idx_users_joindate ON users(joindate);

-- 为 phone 创建唯一索引（如果不存在）
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 为 status 创建索引
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 为 last_participation 创建索引
CREATE INDEX IF NOT EXISTS idx_users_last_participation ON users(last_participation);

-- =====================================================
-- 创建触发器函数（用于自动更新 updated_at）
-- =====================================================

-- 创建或替换更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 users 表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 设置行级安全策略 (RLS)
-- =====================================================

-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;

-- 创建允许所有操作的策略（适用于应用程序）
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 数据迁移和清理
-- =====================================================

-- 更新现有记录的默认值
UPDATE users 
SET 
    joindate = COALESCE(joindate, created_at, NOW()),
    participation_count = COALESCE(participation_count, 1),
    last_participation = COALESCE(last_participation, created_at, NOW()),
    drawchances = COALESCE(drawchances, 1),
    prizeswon = COALESCE(prizeswon, '[]'::jsonb),
    status = COALESCE(status, 'active'),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE 
    joindate IS NULL 
    OR participation_count IS NULL 
    OR last_participation IS NULL 
    OR drawchances IS NULL 
    OR prizeswon IS NULL 
    OR status IS NULL 
    OR created_at IS NULL 
    OR updated_at IS NULL;

-- =====================================================
-- 验证表结构
-- =====================================================

-- 查询表结构以验证所有列都已创建
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'users' 
    AND table_schema = 'public'
ORDER BY 
    ordinal_position;

-- 查询示例数据以确认结构正确
SELECT 
    id, name, phone, email, joindate, 
    participation_count, status, created_at
FROM users 
LIMIT 5;

-- =====================================================
-- 完成提示
-- =====================================================

-- 执行完成后，您应该看到：
-- 1. 所有列都已成功添加
-- 2. 索引已创建
-- 3. 触发器已设置
-- 4. RLS 策略已配置
-- 5. 现有数据已更新默认值

-- 现在可以重新测试应用程序的用户数据导出功能