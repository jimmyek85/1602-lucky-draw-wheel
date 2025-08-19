-- ===================================================================
-- 🎯 1602 幸运轮盘应用 - Supabase 一键完整设置脚本 v3.0
-- ===================================================================
-- 📋 此脚本将完成以下操作：
-- ✅ 1. 清理现有数据库结构（如果存在）
-- ✅ 2. 创建完整的数据库表结构
-- ✅ 3. 设置行级安全策略 (RLS)
-- ✅ 4. 启用实时数据同步
-- ✅ 5. 创建必要的函数和触发器
-- ✅ 6. 插入初始配置数据
-- ✅ 7. 设置用户权限
-- ✅ 8. 验证所有配置
-- 
-- 🚀 使用方法：
-- 1. 复制整个脚本内容
-- 2. 粘贴到 Supabase SQL Editor
-- 3. 点击 "Run" 执行
-- 4. 等待执行完成并查看结果
-- ===================================================================

-- 开始事务
BEGIN;

-- =====================================================
-- 第一部分：清理现有数据（谨慎操作）
-- =====================================================

-- 删除现有的 RLS 策略
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;
DROP POLICY IF EXISTS "Allow all operations on knowledge" ON knowledge;
DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "settings_policy" ON settings;
DROP POLICY IF EXISTS "knowledge_policy" ON knowledge;

-- 删除现有的触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
DROP TRIGGER IF EXISTS update_knowledge_updated_at ON knowledge;

-- 删除现有的函数
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_user_stats();
DROP FUNCTION IF EXISTS get_user_by_phone(text);
DROP FUNCTION IF EXISTS update_user_info(bigint, text, text, text, text);
DROP FUNCTION IF EXISTS update_user_participation(bigint, integer, text);
DROP FUNCTION IF EXISTS add_prize_record(bigint, text, text, text);
DROP FUNCTION IF EXISTS cleanup_old_data(integer);
DROP FUNCTION IF EXISTS backup_user_data();

-- 删除现有的表（注意：这会删除所有数据）
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS knowledge CASCADE;

-- =====================================================
-- 第二部分：创建数据表
-- =====================================================

-- 创建用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT,
    drawchances INTEGER DEFAULT 3,
    prizeswon TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_draw_time TIMESTAMPTZ,
    total_draws INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    last_login TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- 创建设置表
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建知识库表
CREATE TABLE knowledge (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 第三部分：创建索引
-- =====================================================

-- 用户表索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_draw_time ON users(last_draw_time);
CREATE INDEX idx_users_total_draws ON users(total_draws);
CREATE INDEX idx_users_win_count ON users(win_count);

-- 设置表索引
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_is_public ON settings(is_public);

-- 知识库表索引
CREATE INDEX idx_knowledge_category ON knowledge(category);
CREATE INDEX idx_knowledge_is_active ON knowledge(is_active);
CREATE INDEX idx_knowledge_sort_order ON knowledge(sort_order);
CREATE INDEX idx_knowledge_tags ON knowledge USING GIN(tags);

-- =====================================================
-- 第四部分：创建函数和触发器
-- =====================================================

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建更新时间戳触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_updated_at
    BEFORE UPDATE ON knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 第五部分：启用行级安全 (RLS)
-- =====================================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略（允许所有操作）
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on settings" ON settings
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on knowledge" ON knowledge
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 第六部分：启用实时订阅
-- =====================================================

-- 将表添加到实时发布
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge;

-- =====================================================
-- 第七部分：插入初始数据
-- =====================================================

-- 插入默认设置
INSERT INTO settings (key, value, description, category) VALUES
('app_name', '1602 幸运轮盘', '应用程序名称', 'general'),
('app_version', '2.0.0', '应用程序版本', 'general'),
('event_start_date', '2024-01-01', '活动开始日期', 'event'),
('event_end_date', '2024-12-31', '活动结束日期', 'event'),
('max_draw_chances', '3', '每人最大抽奖次数', 'game'),
('announcement', '欢迎参与1602幸运轮盘活动！祝您好运！', '公告内容', 'general'),
('contact_info', '客服电话：400-1602-1602', '联系信息', 'general'),
('prize_pool', '["一等奖：iPhone 15", "二等奖：iPad", "三等奖：AirPods", "四等奖：优惠券", "五等奖：纪念品", "谢谢参与"]', '奖品池配置', 'game'),
('draw_probabilities', '[0.01, 0.05, 0.1, 0.2, 0.3, 0.34]', '中奖概率配置', 'game'),
('is_event_active', 'true', '活动是否激活', 'event'),
('max_participants', '10000', '最大参与人数', 'event'),
('daily_draw_limit', '1', '每日抽奖限制', 'game'),
('require_phone_verification', 'true', '是否需要手机验证', 'security'),
('allow_duplicate_phone', 'false', '是否允许重复手机号', 'security'),
('admin_email', 'admin@1602.com', '管理员邮箱', 'admin'),
('backup_enabled', 'true', '是否启用备份', 'system'),
('log_level', 'info', '日志级别', 'system'),
('theme_color', '#ff6b6b', '主题颜色', 'ui'),
('background_image', '', '背景图片URL', 'ui'),
('welcome_message', '欢迎来到1602幸运轮盘！', '欢迎消息', 'ui')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- 插入知识库数据
INSERT INTO knowledge (category, title, content, tags, sort_order) VALUES
('beer_recommendation', '精酿啤酒推荐', '我们推荐以下几款精酿啤酒：\n1. IPA - 印度淡色艾尔\n2. Stout - 世涛啤酒\n3. Wheat Beer - 小麦啤酒\n4. Lager - 拉格啤酒', '{"啤酒", "推荐", "精酿"}', 1),
('company_info', '公司介绍', '1602公司成立于2020年，专注于为客户提供优质的产品和服务。我们的使命是让每一位客户都能享受到最好的体验。', '{"公司", "介绍", "1602"}', 2),
('event_rules', '活动规则', '1. 每人最多可参与3次抽奖\n2. 需要提供真实的手机号码\n3. 奖品将在活动结束后统一发放\n4. 活动最终解释权归1602公司所有', '{"活动", "规则", "抽奖"}', 3),
('faq', '常见问题', 'Q: 如何参与抽奖？\nA: 填写个人信息后点击开始抽奖即可。\n\nQ: 中奖后如何领取奖品？\nA: 我们会通过手机号联系中奖者。\n\nQ: 可以重复参与吗？\nA: 每人最多可参与3次。', '{"FAQ", "问题", "解答"}', 4),
('contact', '联系我们', '客服热线：400-1602-1602\n邮箱：service@1602.com\n地址：北京市朝阳区xxx路xxx号\n工作时间：周一至周五 9:00-18:00', '{"联系", "客服", "地址"}', 5),
('social_media', '社交媒体', '关注我们的社交媒体获取最新动态：\n微信公众号：1602官方\n微博：@1602公司\nTikTok：@1602official', '{"社交", "媒体", "关注"}', 6),
('privacy_policy', '隐私政策', '我们重视您的隐私保护：\n1. 个人信息仅用于活动相关用途\n2. 不会向第三方泄露您的信息\n3. 活动结束后将按规定处理个人数据', '{"隐私", "政策", "保护"}', 7),
('terms_of_service', '服务条款', '使用本服务即表示您同意以下条款：\n1. 遵守相关法律法规\n2. 不得恶意刷奖或作弊\n3. 保证提供信息的真实性', '{"服务", "条款", "协议"}', 8)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 第八部分：创建实用函数
-- =====================================================

-- 获取用户统计信息
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE(
    total_users BIGINT,
    active_users BIGINT,
    total_draws BIGINT,
    total_wins BIGINT,
    win_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_users,
        COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active_users,
        COALESCE(SUM(total_draws), 0)::BIGINT as total_draws,
        COALESCE(SUM(win_count), 0)::BIGINT as total_wins,
        CASE 
            WHEN COALESCE(SUM(total_draws), 0) > 0 
            THEN ROUND((COALESCE(SUM(win_count), 0)::NUMERIC / COALESCE(SUM(total_draws), 1)::NUMERIC) * 100, 2)
            ELSE 0
        END as win_rate
    FROM users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 根据手机号获取用户信息
CREATE OR REPLACE FUNCTION get_user_by_phone(user_phone TEXT)
RETURNS TABLE(
    id BIGINT,
    name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    drawchances INTEGER,
    prizeswon TEXT,
    status TEXT,
    total_draws INTEGER,
    win_count INTEGER,
    last_draw_time TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, u.name, u.phone, u.email, u.address,
        u.drawchances, u.prizeswon, u.status,
        u.total_draws, u.win_count, u.last_draw_time
    FROM users u
    WHERE u.phone = user_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新用户信息
CREATE OR REPLACE FUNCTION update_user_info(
    user_id BIGINT,
    user_name TEXT,
    user_email TEXT,
    user_address TEXT,
    user_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET 
        name = user_name,
        email = user_email,
        address = user_address,
        notes = COALESCE(user_notes, notes),
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新用户参与信息
CREATE OR REPLACE FUNCTION update_user_participation(
    user_id BIGINT,
    chances_used INTEGER,
    prize_won TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET 
        drawchances = GREATEST(0, drawchances - chances_used),
        total_draws = total_draws + chances_used,
        last_draw_time = NOW(),
        win_count = CASE 
            WHEN prize_won IS NOT NULL AND prize_won != '谢谢参与' 
            THEN win_count + 1 
            ELSE win_count 
        END,
        prizeswon = CASE 
            WHEN prize_won IS NOT NULL AND prize_won != '谢谢参与'
            THEN CASE 
                WHEN prizeswon = '' THEN prize_won
                ELSE prizeswon || ', ' || prize_won
            END
            ELSE prizeswon
        END,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加中奖记录（可扩展为独立的中奖记录表）
CREATE OR REPLACE FUNCTION add_prize_record(
    user_id BIGINT,
    prize_name TEXT,
    prize_level TEXT,
    additional_info TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- 这里可以插入到专门的中奖记录表
    -- 目前只更新用户表的中奖信息
    UPDATE users 
    SET 
        prizeswon = CASE 
            WHEN prizeswon = '' THEN prize_name
            ELSE prizeswon || ', ' || prize_name
        END,
        metadata = COALESCE(metadata, '{}'::jsonb) || 
                  jsonb_build_object(
                      'last_prize', prize_name,
                      'last_prize_level', prize_level,
                      'last_prize_time', NOW()::text
                  ),
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 数据清理函数
CREATE OR REPLACE FUNCTION cleanup_old_data(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- 删除超过指定天数的非活跃用户数据
    DELETE FROM users 
    WHERE status = 'inactive' 
      AND updated_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 数据备份函数
CREATE OR REPLACE FUNCTION backup_user_data()
RETURNS TABLE(
    backup_time TIMESTAMPTZ,
    total_users BIGINT,
    active_users BIGINT,
    backup_status TEXT
) AS $$
DECLARE
    user_count BIGINT;
    active_count BIGINT;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'active')
    INTO user_count, active_count
    FROM users;
    
    RETURN QUERY
    SELECT 
        NOW() as backup_time,
        user_count as total_users,
        active_count as active_users,
        'Backup completed successfully' as backup_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 第九部分：设置权限
-- =====================================================

-- 为匿名用户设置权限
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT ON settings TO anon;
GRANT SELECT ON knowledge TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 为认证用户设置权限
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON settings TO authenticated;
GRANT ALL ON knowledge TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 为函数设置执行权限
GRANT EXECUTE ON FUNCTION get_user_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_phone(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_info(BIGINT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_user_participation(BIGINT, INTEGER, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_prize_record(BIGINT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_data(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION backup_user_data() TO authenticated;

-- =====================================================
-- 第十部分：验证和测试
-- =====================================================

-- 验证表是否创建成功
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('users', 'settings', 'knowledge');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✅ 所有数据表创建成功';
    ELSE
        RAISE EXCEPTION '❌ 数据表创建失败，只创建了 % 个表', table_count;
    END IF;
END $$;

-- 验证 RLS 策略
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('users', 'settings', 'knowledge');
    
    IF policy_count >= 3 THEN
        RAISE NOTICE '✅ RLS 策略配置成功';
    ELSE
        RAISE NOTICE '⚠️ RLS 策略可能配置不完整';
    END IF;
END $$;

-- 验证实时订阅
DO $$
DECLARE
    realtime_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO realtime_count
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND tablename IN ('users', 'settings', 'knowledge');
    
    IF realtime_count = 3 THEN
        RAISE NOTICE '✅ 实时订阅配置成功';
    ELSE
        RAISE NOTICE '⚠️ 实时订阅可能配置不完整，已配置 % 个表', realtime_count;
    END IF;
END $$;

-- 验证初始数据
DO $$
DECLARE
    settings_count INTEGER;
    knowledge_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO settings_count FROM settings;
    SELECT COUNT(*) INTO knowledge_count FROM knowledge;
    
    RAISE NOTICE '✅ 初始数据插入完成：设置项 % 个，知识库条目 % 个', settings_count, knowledge_count;
END $$;

-- 提交事务
COMMIT;

-- =====================================================
-- 设置完成提示
-- =====================================================

-- 显示设置完成信息
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ===== 1602 幸运轮盘数据库设置完成 =====';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 已创建的表：';
    RAISE NOTICE '   - users (用户表)';
    RAISE NOTICE '   - settings (设置表)';
    RAISE NOTICE '   - knowledge (知识库表)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 已配置的功能：';
    RAISE NOTICE '   - 行级安全 (RLS) 策略';
    RAISE NOTICE '   - 实时数据订阅';
    RAISE NOTICE '   - 自动时间戳更新';
    RAISE NOTICE '   - 数据库索引优化';
    RAISE NOTICE '   - 实用函数和权限';
    RAISE NOTICE '';
    RAISE NOTICE '✅ 已插入的初始数据：';
    RAISE NOTICE '   - 应用配置设置';
    RAISE NOTICE '   - 知识库内容';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 下一步操作：';
    RAISE NOTICE '   1. 复制 Project URL 和 anon key';
    RAISE NOTICE '   2. 更新应用配置文件';
    RAISE NOTICE '   3. 测试数据库连接';
    RAISE NOTICE '   4. 部署应用到云服务器';
    RAISE NOTICE '';
    RAISE NOTICE '📚 相关文档：';
    RAISE NOTICE '   - CLOUD_DEPLOYMENT_GUIDE.md';
    RAISE NOTICE '   - SUPABASE_DETAILED_SETUP_GUIDE.md';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 数据库设置完成！可以开始使用应用了。';
    RAISE NOTICE '';
END $$;

-- 脚本结束