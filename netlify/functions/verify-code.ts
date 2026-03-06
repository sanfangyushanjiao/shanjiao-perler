import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
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

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get IP for rate limiting
    const ip = event.headers['x-forwarded-for']?.split(',')[0] ||
               event.headers['x-real-ip'] ||
               event.headers['client-ip'] ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: '请求过于频繁，请稍后再试' }),
      };
    }

    // Get code from request
    const { code } = JSON.parse(event.body || '{}');

    if (!code || typeof code !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '激活码不能为空' }),
      };
    }

    const normalizedCode = code.toUpperCase().trim();

    // Validate format
    const codeRegex = /^SJ-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    if (!codeRegex.test(normalizedCode)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '激活码格式不正确' }),
      };
    }

    // Query database
    const { data: codeData, error: queryError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (queryError || !codeData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: '激活码不存在' }),
      };
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
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: '激活失败，请重试' }),
        };
      }

      // Log usage
      await supabase.from('usage_logs').insert({
        code_id: codeData.id,
        code: normalizedCode,
        user_agent: event.headers['user-agent'] || 'unknown',
        ip_address: ip,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          type: codeData.type,
          activatedAt: now.toISOString(),
          expiresAt: expiresAt?.toISOString() || null,
        }),
      };
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

        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: '激活码已过期' }),
        };
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
        user_agent: event.headers['user-agent'] || 'unknown',
        ip_address: ip,
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          type: codeData.type,
          activatedAt: codeData.activated_at,
          expiresAt: codeData.expires_at,
        }),
      };
    }

    // Handle expired code
    if (codeData.status === 'expired') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: '激活码已过期' }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: '激活码状态异常' }),
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '服务器错误，请稍后重试' }),
    };
  }
};
