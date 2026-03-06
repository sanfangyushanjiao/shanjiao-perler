import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limit: 5 requests per minute per IP
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Calculate expiry time based on type
function calculateExpiryTime(type: string, activatedAt: Date): Date | null {
  switch (type) {
    case '24h':
      return new Date(activatedAt.getTime() + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(activatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'lifetime':
      return null; // No expiry
    default:
      throw new Error('Invalid activation type');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get IP for rate limiting
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
               (req.headers['x-real-ip'] as string) ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error: '请求过于频繁，请稍后再试'
      });
    }

    // Get code from request
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: '激活码不能为空' });
    }

    const normalizedCode = code.toUpperCase().trim();

    // Validate format
    const codeRegex = /^SJ-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    if (!codeRegex.test(normalizedCode)) {
      return res.status(400).json({ error: '激活码格式不正确' });
    }

    // Query database
    const { data: codeData, error: queryError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (queryError || !codeData) {
      return res.status(404).json({ error: '激活码不存在' });
    }

    const now = new Date();

    // Handle first-time activation
    if (codeData.status === 'unused') {
      const expiresAt = calculateExpiryTime(codeData.type, now);

      // Update code status
      const { error: updateError } = await supabase
        .from('activation_codes')
        .update({
          status: 'active',
          activated_at: now.toISOString(),
          expires_at: expiresAt?.toISOString() || null,
          last_used_at: now.toISOString(),
        })
        .eq('id', codeData.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({ error: '激活失败，请重试' });
      }

      // Log usage
      await supabase.from('usage_logs').insert({
        code_id: codeData.id,
        code: normalizedCode,
        user_agent: req.headers['user-agent'] || 'unknown',
        ip_address: ip,
      });

      return res.status(200).json({
        success: true,
        type: codeData.type,
        activatedAt: now.toISOString(),
        expiresAt: expiresAt?.toISOString() || null,
      });
    }

    // Handle already activated code
    if (codeData.status === 'active') {
      // Check if expired
      if (codeData.expires_at && new Date(codeData.expires_at) < now) {
        // Mark as expired
        await supabase
          .from('activation_codes')
          .update({ status: 'expired' })
          .eq('id', codeData.id);

        return res.status(403).json({ error: '激活码已过期' });
      }

      // Update last used time
      await supabase
        .from('activation_codes')
        .update({ last_used_at: now.toISOString() })
        .eq('id', codeData.id);

      // Log usage
      await supabase.from('usage_logs').insert({
        code_id: codeData.id,
        code: normalizedCode,
        user_agent: req.headers['user-agent'] || 'unknown',
        ip_address: ip,
      });

      return res.status(200).json({
        success: true,
        type: codeData.type,
        activatedAt: codeData.activated_at,
        expiresAt: codeData.expires_at,
      });
    }

    // Handle expired code
    if (codeData.status === 'expired') {
      return res.status(403).json({ error: '激活码已过期' });
    }

    return res.status(400).json({ error: '激活码状态异常' });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
}
