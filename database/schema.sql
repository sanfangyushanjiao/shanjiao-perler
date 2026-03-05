-- 山椒爱拼豆 - 数据库结构
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 激活码表
CREATE TABLE IF NOT EXISTS activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,           -- 格式: SJ-XXXX-XXXX-XXXX
  type VARCHAR(20) NOT NULL,                   -- '24h', '7d', 'lifetime'
  status VARCHAR(20) NOT NULL DEFAULT 'unused', -- 'unused', 'active', 'expired'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,

  price DECIMAL(10,2),
  batch_id VARCHAR(50),

  CONSTRAINT valid_type CHECK (type IN ('24h', '7d', 'lifetime')),
  CONSTRAINT valid_status CHECK (status IN ('unused', 'active', 'expired'))
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_status ON activation_codes(status);
CREATE INDEX IF NOT EXISTS idx_activation_codes_type ON activation_codes(type);
CREATE INDEX IF NOT EXISTS idx_activation_codes_batch_id ON activation_codes(batch_id);

-- 2. 使用记录表
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES activation_codes(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(45),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_usage_logs_code_id ON usage_logs(code_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_ip ON usage_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_usage_logs_used_at ON usage_logs(used_at);

-- 3. 添加注释
COMMENT ON TABLE activation_codes IS '激活码表';
COMMENT ON COLUMN activation_codes.code IS '激活码，格式: SJ-XXXX-XXXX-XXXX';
COMMENT ON COLUMN activation_codes.type IS '类型: 24h, 7d, lifetime';
COMMENT ON COLUMN activation_codes.status IS '状态: unused, active, expired';
COMMENT ON COLUMN activation_codes.batch_id IS '批次ID，用于追踪';

COMMENT ON TABLE usage_logs IS '使用记录表';
COMMENT ON COLUMN usage_logs.code_id IS '关联的激活码ID';
COMMENT ON COLUMN usage_logs.ip_address IS '用户IP地址';

-- 4. 启用 Row Level Security (可选，如果需要前端直接访问)
-- ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- 5. 创建只读策略 (可选)
-- CREATE POLICY "Allow public read on active codes" ON activation_codes
--   FOR SELECT USING (status = 'active');
