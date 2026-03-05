import express from 'express';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// 速率限制
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (record.count >= 5) {
    return false;
  }

  record.count++;
  return true;
}

app.post('/api/verify-code', async (req, res) => {
  try {
    const { code } = req.body;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // 速率限制
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    }

    if (!code) {
      return res.status(400).json({ error: '激活码不能为空' });
    }

    // 查询激活码
    const { data: codeData, error: queryError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (queryError || !codeData) {
      return res.status(404).json({ error: '激活码不存在或已被使用' });
    }

    const now = new Date();

    // 检查状态
    if (codeData.status === 'expired') {
      return res.status(400).json({ error: '激活码已过期' });
    }

    // 如果是首次激活
    if (codeData.status === 'unused') {
      let expiresAt: Date | null = null;

      // 计算过期时间
      switch (codeData.type) {
        case '24h':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'lifetime':
          expiresAt = null;
          break;
      }

      // 更新激活码状态
      const { error: updateError } = await supabase
        .from('activation_codes')
        .update({
          status: 'active',
          activated_at: now.toISOString(),
          expires_at: expiresAt ? expiresAt.toISOString() : null,
          last_used_at: now.toISOString(),
        })
        .eq('id', codeData.id);

      if (updateError) {
        console.error('更新激活码失败:', updateError);
        return res.status(500).json({ error: '激活失败，请稍后重试' });
      }

      // 记录使用日志
      await supabase.from('usage_logs').insert({
        code_id: codeData.id,
        code: code.toUpperCase(),
        user_agent: req.headers['user-agent'] || '',
        ip_address: ip,
      });

      return res.json({
        success: true,
        type: codeData.type,
        activatedAt: now.toISOString(),
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
      });
    }

    // 如果已激活，检查是否过期
    if (codeData.status === 'active') {
      if (codeData.expires_at) {
        const expiresAt = new Date(codeData.expires_at);
        if (now > expiresAt) {
          // 标记为过期
          await supabase
            .from('activation_codes')
            .update({ status: 'expired' })
            .eq('id', codeData.id);

          return res.status(400).json({ error: '激活码已过期' });
        }
      }

      // 更新最后使用时间
      await supabase
        .from('activation_codes')
        .update({ last_used_at: now.toISOString() })
        .eq('id', codeData.id);

      // 记录使用日志
      await supabase.from('usage_logs').insert({
        code_id: codeData.id,
        code: code.toUpperCase(),
        user_agent: req.headers['user-agent'] || '',
        ip_address: ip,
      });

      return res.json({
        success: true,
        type: codeData.type,
        activatedAt: codeData.activated_at,
        expiresAt: codeData.expires_at,
      });
    }

    return res.status(400).json({ error: '激活码状态异常' });
  } catch (error) {
    console.error('验证激活码错误:', error);
    return res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✅ 本地测试服务器已启动`);
  console.log(`📡 API 地址: http://localhost:${PORT}/api/verify-code`);
  console.log(`\n现在可以在另一个终端运行: npm run dev\n`);
});
