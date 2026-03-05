# 🔍 激活码管理和查询工具

## 快速查询激活码状态

### 方法1: 通过 Supabase 控制台（推荐）

1. **登录 Supabase**
   - 访问: https://supabase.com/dashboard
   - 选择项目: shanjiao-perler

2. **查看激活码表**
   ```
   左侧菜单 → Table Editor → activation_codes
   ```

3. **常用查询**

   #### 查看所有未使用的激活码
   ```
   点击 "status" 列筛选 → 选择 "unused"
   ```

   #### 查看所有已激活的激活码
   ```
   点击 "status" 列筛选 → 选择 "active"
   ```

   #### 查看已过期的激活码
   ```
   点击 "status" 列筛选 → 选择 "expired"
   ```

   #### 按类型查看激活码
   ```
   点击 "type" 列筛选 → 选择 "24h" / "7d" / "lifetime"
   ```

---

## 方法2: SQL 查询（高级）

在 Supabase SQL Editor 执行以下查询：

### 查看库存统计
```sql
SELECT
  type,
  status,
  COUNT(*) as count
FROM activation_codes
GROUP BY type, status
ORDER BY type, status;
```

**输出示例**:
```
type      | status  | count
----------|---------|-------
24h       | unused  | 150
24h       | active  | 45
24h       | expired | 5
7d        | unused  | 80
7d        | active  | 18
7d        | expired | 2
lifetime  | unused  | 40
lifetime  | active  | 10
```

### 查看今日激活统计
```sql
SELECT
  type,
  COUNT(*) as activated_today
FROM activation_codes
WHERE DATE(activated_at) = CURRENT_DATE
GROUP BY type;
```

### 查看即将过期的激活码（24小时内）
```sql
SELECT
  code,
  type,
  expires_at,
  EXTRACT(EPOCH FROM (expires_at - NOW())) / 3600 as hours_remaining
FROM activation_codes
WHERE status = 'active'
  AND expires_at IS NOT NULL
  AND expires_at < NOW() + INTERVAL '24 hours'
ORDER BY expires_at;
```

### 查看热门激活码（使用次数最多）
```sql
SELECT
  ac.code,
  ac.type,
  ac.status,
  COUNT(ul.id) as usage_count,
  ac.activated_at,
  ac.last_used_at
FROM activation_codes ac
LEFT JOIN usage_logs ul ON ac.id = ul.code_id
WHERE ac.status = 'active'
GROUP BY ac.id
ORDER BY usage_count DESC
LIMIT 20;
```

### 查看收入统计
```sql
SELECT
  type,
  COUNT(*) as sold_count,
  SUM(price) as total_revenue,
  AVG(price) as avg_price
FROM activation_codes
WHERE status IN ('active', 'expired')
GROUP BY type;
```

### 查看用户活跃时间分布
```sql
SELECT
  EXTRACT(HOUR FROM used_at) as hour,
  COUNT(*) as usage_count
FROM usage_logs
WHERE used_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;
```

---

## 方法3: 创建查询脚本

创建一个 Node.js 脚本来查询激活码状态：

### 创建 scripts/check-codes.ts

```typescript
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function checkInventory() {
  const { data, error } = await supabase
    .from('activation_codes')
    .select('type, status')

  if (error) {
    console.error('查询失败:', error)
    return
  }

  // 统计库存
  const stats: any = {}
  data.forEach(code => {
    const key = `${code.type}_${code.status}`
    stats[key] = (stats[key] || 0) + 1
  })

  console.log('\n📊 激活码库存统计\n')
  console.log('类型\t\t未使用\t已激活\t已过期')
  console.log('─'.repeat(50))

  const types = ['24h', '7d', 'lifetime']
  types.forEach(type => {
    const unused = stats[`${type}_unused`] || 0
    const active = stats[`${type}_active`] || 0
    const expired = stats[`${type}_expired`] || 0
    console.log(`${type}\t\t${unused}\t${active}\t${expired}`)
  })

  // 低库存警告
  console.log('\n⚠️  库存警告\n')
  types.forEach(type => {
    const unused = stats[`${type}_unused`] || 0
    if (unused < 20) {
      console.log(`❌ ${type} 库存不足！仅剩 ${unused} 个，建议立即补货`)
    } else if (unused < 50) {
      console.log(`⚠️  ${type} 库存偏低，剩余 ${unused} 个`)
    } else {
      console.log(`✅ ${type} 库存充足，剩余 ${unused} 个`)
    }
  })
}

async function checkRevenue() {
  const { data, error } = await supabase
    .from('activation_codes')
    .select('type, price, status')
    .in('status', ['active', 'expired'])

  if (error) {
    console.error('查询失败:', error)
    return
  }

  const revenue: any = { total: 0 }
  data.forEach(code => {
    revenue[code.type] = (revenue[code.type] || 0) + (code.price || 0)
    revenue.total += code.price || 0
  })

  console.log('\n💰 收入统计\n')
  console.log('24小时版:\t¥' + (revenue['24h'] || 0).toFixed(2))
  console.log('七天版:\t\t¥' + (revenue['7d'] || 0).toFixed(2))
  console.log('永久版:\t\t¥' + (revenue['lifetime'] || 0).toFixed(2))
  console.log('─'.repeat(50))
  console.log('总收入:\t\t¥' + revenue.total.toFixed(2))
}

async function main() {
  console.log('🔍 山椒爱拼豆 - 激活码管理系统\n')
  await checkInventory()
  await checkRevenue()
}

main()
```

### 添加到 package.json
```json
{
  "scripts": {
    "check:codes": "tsx scripts/check-codes.ts"
  }
}
```

### 运行查询
```bash
npm run check:codes
```

---

## 常见管理任务

### 1. 手动标记激活码为已使用
```sql
UPDATE activation_codes
SET status = 'active',
    activated_at = NOW(),
    expires_at = NOW() + INTERVAL '24 hours'
WHERE code = 'SJ-XXXX-XXXX-XXXX';
```

### 2. 延长激活码有效期
```sql
UPDATE activation_codes
SET expires_at = expires_at + INTERVAL '7 days'
WHERE code = 'SJ-XXXX-XXXX-XXXX';
```

### 3. 将过期激活码改为永久
```sql
UPDATE activation_codes
SET type = 'lifetime',
    expires_at = NULL,
    status = 'active'
WHERE code = 'SJ-XXXX-XXXX-XXXX';
```

### 4. 重置激活码（退款处理）
```sql
UPDATE activation_codes
SET status = 'unused',
    activated_at = NULL,
    expires_at = NULL,
    last_used_at = NULL
WHERE code = 'SJ-XXXX-XXXX-XXXX';
```

### 5. 删除测试激活码
```sql
DELETE FROM activation_codes
WHERE code LIKE 'SJ-TEST-%';
```

### 6. 批量生成优惠码（8折永久版）
```sql
-- 先在本地生成激活码，然后导入时修改价格
UPDATE activation_codes
SET price = 7.92  -- 9.9 × 0.8
WHERE batch_id = 'YOUR_BATCH_ID'
  AND type = 'lifetime';
```

---

## 自动化监控

### 创建每日监控报告

创建 `scripts/daily-report.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function generateDailyReport() {
  const today = new Date().toISOString().split('T')[0]

  // 今日激活数
  const { data: activatedToday } = await supabase
    .from('activation_codes')
    .select('type')
    .gte('activated_at', today)

  // 今日使用次数
  const { data: usagesToday } = await supabase
    .from('usage_logs')
    .select('code')
    .gte('used_at', today)

  // 当前库存
  const { data: inventory } = await supabase
    .from('activation_codes')
    .select('type, status')

  console.log(`\n📅 ${today} 日报\n`)
  console.log('今日激活:', activatedToday?.length || 0, '个')
  console.log('今日使用:', usagesToday?.length || 0, '次')

  // 可以发送到邮箱或消息推送
}

generateDailyReport()
```

### 设置定时任务（Windows）

创建 `daily-report.bat`:
```batch
@echo off
cd C:\Users\ASUS\shanjiao-perler
npm run daily:report
```

在 Windows 任务计划程序中添加每日定时任务：
```
触发器: 每天 09:00
操作: 运行 daily-report.bat
```

---

## 数据导出

### 导出所有激活码数据（备份）
```sql
COPY (
  SELECT * FROM activation_codes
  ORDER BY created_at DESC
) TO 'activation_codes_backup.csv'
WITH (FORMAT CSV, HEADER);
```

### 导出今日销售记录
```sql
COPY (
  SELECT
    code,
    type,
    price,
    activated_at,
    expires_at
  FROM activation_codes
  WHERE DATE(activated_at) = CURRENT_DATE
  ORDER BY activated_at DESC
) TO 'sales_today.csv'
WITH (FORMAT CSV, HEADER);
```

---

## 性能优化建议

### 1. 定期清理旧数据

过期超过 30 天的激活码可以归档：

```sql
-- 创建归档表
CREATE TABLE activation_codes_archive AS
SELECT * FROM activation_codes WHERE 1=0;

-- 归档过期超过30天的数据
INSERT INTO activation_codes_archive
SELECT * FROM activation_codes
WHERE status = 'expired'
  AND expires_at < NOW() - INTERVAL '30 days';

-- 删除已归档数据
DELETE FROM activation_codes
WHERE status = 'expired'
  AND expires_at < NOW() - INTERVAL '30 days';
```

### 2. 定期清理使用日志

保留最近 90 天的日志即可：

```sql
DELETE FROM usage_logs
WHERE used_at < NOW() - INTERVAL '90 days';
```

---

## 📞 支持

如需更多查询功能或自定义报表，请告诉我具体需求！
