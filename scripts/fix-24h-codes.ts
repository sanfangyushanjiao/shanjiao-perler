import * as fs from 'fs';

/**
 * 修复 dujiaoka-codes-24h.txt 文件
 * 将连在一起的激活码分行
 */

console.log('\n🔧 修复 24小时激活码文件...\n');

const inputFile = 'dujiaoka-codes-24h.txt';

if (!fs.existsSync(inputFile)) {
  console.log('❌ 文件不存在');
  process.exit(1);
}

// 读取文件
const content = fs.readFileSync(inputFile, 'utf-8');

// 用正则提取所有激活码（SJ-开头的格式）
const codePattern = /SJ-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}/gi;
const codes = content.match(codePattern) || [];

console.log(`📄 找到 ${codes.length} 个激活码`);

if (codes.length === 0) {
  console.log('❌ 未找到有效的激活码');
  process.exit(1);
}

// 写回文件（每行一个）
fs.writeFileSync(inputFile, codes.join('\n'), 'utf-8');

console.log(`✅ 已修复 ${inputFile}`);
console.log(`   每行一个激活码，共 ${codes.length} 行\n`);

// 显示前5个
console.log('📋 前5个激活码：');
codes.slice(0, 5).forEach((code, i) => {
  console.log(`   ${i + 1}. ${code}`);
});
console.log('');
