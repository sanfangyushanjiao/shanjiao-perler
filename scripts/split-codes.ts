import * as fs from 'fs';
import * as path from 'path';

/**
 * 将激活码文件分割成两部分：
 * - 一半给闲鱼
 * - 一半给拼多多
 */

console.log('\n🔪 开始分割激活码文件...\n');

// 要处理的文件
const files = [
  { input: 'dujiaoka-codes-24h.txt', type: '24h', total: 100 },
  { input: 'dujiaoka-codes-7d.txt', type: '7d', total: 50 },
  { input: 'dujiaoka-codes-lifetime.txt', type: 'lifetime', total: 20 }
];

files.forEach(({ input, type, total }) => {
  // 检查文件是否存在
  if (!fs.existsSync(input)) {
    console.log(`⚠️  ${input} 不存在，跳过`);
    return;
  }

  // 读取激活码
  const content = fs.readFileSync(input, 'utf-8');
  const codes = content.split('\n').filter(line => line.trim() && line.startsWith('SJ-'));

  console.log(`📄 ${input}`);
  console.log(`   总数: ${codes.length} 个激活码`);

  // 分成两半
  const half = Math.ceil(codes.length / 2);
  const xianyu = codes.slice(0, half);
  const pinduoduo = codes.slice(half);

  // 生成文件名
  const xianyuFile = `闲鱼-激活码-${type}.txt`;
  const pinduoduoFile = `拼多多-激活码-${type}.txt`;

  // 写入文件
  fs.writeFileSync(xianyuFile, xianyu.join('\n'), 'utf-8');
  fs.writeFileSync(pinduoduoFile, pinduoduo.join('\n'), 'utf-8');

  console.log(`   ✅ 闲鱼: ${xianyu.length} 个 → ${xianyuFile}`);
  console.log(`   ✅ 拼多多: ${pinduoduo.length} 个 → ${pinduoduoFile}`);
  console.log('');
});

console.log('🎉 分割完成！\n');
console.log('📁 生成的文件：\n');

const outputFiles = fs.readdirSync('.')
  .filter(f => f.startsWith('闲鱼-') || f.startsWith('拼多多-'))
  .sort();

outputFiles.forEach(f => {
  const lines = fs.readFileSync(f, 'utf-8').split('\n').filter(l => l.trim());
  console.log(`   ${f} (${lines.length} 个激活码)`);
});

console.log('\n📝 使用说明：');
console.log('   - 闲鱼-激活码-*.txt → 导入到闲鱼自动发货工具');
console.log('   - 拼多多-激活码-*.txt → 导入到拼多多电子卡券');
console.log('   - 两个平台的激活码完全独立，不会重复！\n');
