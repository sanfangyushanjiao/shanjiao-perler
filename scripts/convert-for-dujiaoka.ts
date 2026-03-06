import * as fs from 'fs';
import * as path from 'path';

// 查找所有 CSV 文件
const files = fs.readdirSync('.').filter(f => f.startsWith('activation-codes-') && f.endsWith('.csv'));

if (files.length === 0) {
  console.log('❌ 未找到激活码 CSV 文件');
  process.exit(1);
}

console.log('\n🔄 开始转换激活码格式（适用于独角数卡）\n');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // 提取类型
  let type = 'unknown';
  if (file.includes('24h')) type = '24h';
  else if (file.includes('7d')) type = '7d';
  else if (file.includes('lifetime')) type = 'lifetime';

  // 跳过表头，提取激活码（第一列）
  const codes = lines
    .slice(1) // 跳过第一行表头
    .map(line => line.trim().split(',')[0]) // 取第一列
    .filter(code => code && code.startsWith('SJ-')); // 过滤空行

  // 生成输出文件名
  const outputFile = `dujiaoka-codes-${type}.txt`;

  // 写入文件（每行一个激活码）
  fs.writeFileSync(outputFile, codes.join('\n'), 'utf-8');

  console.log(`✅ ${file}`);
  console.log(`   → ${outputFile}`);
  console.log(`   → ${codes.length} 个激活码\n`);
});

console.log('🎉 转换完成！\n');
console.log('📁 生成的文件：\n');
const outputFiles = fs.readdirSync('.').filter(f => f.startsWith('dujiaoka-codes-'));
outputFiles.forEach(f => {
  const lines = fs.readFileSync(f, 'utf-8').split('\n').filter(l => l.trim());
  console.log(`   ${f} (${lines.length} 个激活码)`);
});

console.log('\n📝 使用方法：');
console.log('   1. 在独角数卡后台创建商品');
console.log('   2. 进入商品的【卡密管理】');
console.log('   3. 选择【批量导入】');
console.log('   4. 上传对应的 dujiaoka-codes-*.txt 文件');
console.log('   5. 点击导入\n');
