import { createClient } from '@supabase/supabase-js';
import { createWriteStream } from 'fs';
import { join } from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 错误: 请设置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse command line arguments
const args = process.argv.slice(2);
const typeIndex = args.indexOf('--type');
const countIndex = args.indexOf('--count');
const batchIndex = args.indexOf('--batch');

if (typeIndex === -1 || countIndex === -1) {
  console.error('用法: tsx generate-codes.ts --type <24h|7d|lifetime> --count <数量> [--batch <批次ID>]');
  process.exit(1);
}

const type = args[typeIndex + 1] as '24h' | '7d' | 'lifetime';
const count = parseInt(args[countIndex + 1], 10);
const batchId = batchIndex !== -1 ? args[batchIndex + 1] : `batch-${Date.now()}`;

if (!['24h', '7d', 'lifetime'].includes(type)) {
  console.error('❌ 类型必须是: 24h, 7d, 或 lifetime');
  process.exit(1);
}

if (isNaN(count) || count <= 0) {
  console.error('❌ 数量必须是正整数');
  process.exit(1);
}

// Price mapping
const priceMap = {
  '24h': 1.8,
  '7d': 6.6,
  'lifetime': 9.9,
};

// Calculate CRC-8 checksum
function calculateCRC8(data: string): number {
  let crc = 0;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80) {
        crc = (crc << 1) ^ 0x07;
      } else {
        crc <<= 1;
      }
    }
  }
  return crc & 0xFF;
}

// Generate activation code with checksum
function generateCode(): string {
  // Generate 11 random hex characters
  const chars = '0123456789ABCDEF';
  let code = '';
  for (let i = 0; i < 11; i++) {
    code += chars[Math.floor(Math.random() * 16)];
  }

  // Calculate checksum
  const checksum = calculateCRC8(code);
  const checksumHex = checksum.toString(16).toUpperCase().padStart(2, '0').slice(-1);

  // Format as SJ-XXXX-XXXX-XXXX
  const fullCode = code + checksumHex;
  return `SJ-${fullCode.slice(0, 4)}-${fullCode.slice(4, 8)}-${fullCode.slice(8, 12)}`;
}

// Check if code exists in database
async function codeExists(code: string): Promise<boolean> {
  const { data } = await supabase
    .from('activation_codes')
    .select('code')
    .eq('code', code)
    .single();

  return !!data;
}

// Generate unique codes
async function generateUniqueCodes(count: number): Promise<string[]> {
  const codes: string[] = [];
  const attempts = count * 10; // Max attempts to avoid infinite loop

  console.log(`🔄 正在生成 ${count} 个激活码...`);

  for (let i = 0; i < attempts && codes.length < count; i++) {
    const code = generateCode();

    // Check uniqueness in current batch
    if (codes.includes(code)) {
      continue;
    }

    // Check uniqueness in database
    if (await codeExists(code)) {
      continue;
    }

    codes.push(code);

    if (codes.length % 10 === 0) {
      console.log(`  ✓ 已生成 ${codes.length}/${count}`);
    }
  }

  if (codes.length < count) {
    console.warn(`⚠️  警告: 仅生成了 ${codes.length}/${count} 个唯一激活码`);
  }

  return codes;
}

// Insert codes into database
async function insertCodes(codes: string[], type: string, batchId: string) {
  console.log(`\n💾 正在保存到数据库...`);

  const records = codes.map(code => ({
    code,
    type,
    status: 'unused',
    price: priceMap[type as keyof typeof priceMap],
    batch_id: batchId,
  }));

  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('activation_codes').insert(batch);

    if (error) {
      console.error(`❌ 插入失败 (batch ${i / batchSize + 1}):`, error);
      throw error;
    }

    console.log(`  ✓ 已保存 ${Math.min(i + batchSize, records.length)}/${records.length}`);
  }
}

// Export to CSV
function exportToCSV(codes: string[], type: string, batchId: string) {
  const filename = `activation-codes-${type}-${batchId}.csv`;
  const filepath = join(process.cwd(), filename);

  console.log(`\n📄 正在导出到 CSV: ${filename}`);

  const stream = createWriteStream(filepath);
  stream.write('code,type,price\n');

  codes.forEach(code => {
    stream.write(`${code},${type},${priceMap[type as keyof typeof priceMap]}\n`);
  });

  stream.end();

  console.log(`  ✓ 导出成功: ${filepath}`);
}

// Main function
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  山椒爱拼豆 - 激活码生成工具');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`类型: ${type}`);
  console.log(`数量: ${count}`);
  console.log(`批次: ${batchId}`);
  console.log(`价格: ¥${priceMap[type]}`);
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Generate codes
    const codes = await generateUniqueCodes(count);

    if (codes.length === 0) {
      console.error('❌ 未能生成任何激活码');
      process.exit(1);
    }

    // Insert into database
    await insertCodes(codes, type, batchId);

    // Export to CSV
    exportToCSV(codes, type, batchId);

    console.log('\n✅ 完成!');
    console.log(`   生成: ${codes.length} 个激活码`);
    console.log(`   总价值: ¥${(codes.length * priceMap[type]).toFixed(2)}`);
    console.log('\n下一步:');
    console.log('  1. 在发卡平台创建商品');
    console.log(`  2. 上传 CSV 文件: activation-codes-${type}-${batchId}.csv`);
    console.log('  3. 配置自动发货');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  }
}

main();
