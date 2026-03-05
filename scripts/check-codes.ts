import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface ActivationCode {
  type: string
  status: string
  price?: number
}

async function checkInventory() {
  const { data, error } = await supabase
    .from('activation_codes')
    .select('type, status')

  if (error) {
    console.error('❌ 查询失败:', error.message)
    return
  }

  // 统计库存
  const stats: Record<string, number> = {}
  data.forEach((code: ActivationCode) => {
    const key = `${code.type}_${code.status}`
    stats[key] = (stats[key] || 0) + 1
  })

  console.log('\n' + '═'.repeat(60))
  console.log('📊 激活码库存统计')
  console.log('═'.repeat(60))
  console.log('\n类型\t\t未使用\t\t已激活\t\t已过期')
  console.log('─'.repeat(60))

  const types = [
    { key: '24h', name: '24小时版' },
    { key: '7d', name: '七天版  ' },
    { key: 'lifetime', name: '永久版  ' }
  ]

  types.forEach(({ key, name }) => {
    const unused = stats[`${key}_unused`] || 0
    const active = stats[`${key}_active`] || 0
    const expired = stats[`${key}_expired`] || 0
    console.log(`${name}\t\t${unused}\t\t${active}\t\t${expired}`)
  })

  console.log('─'.repeat(60))

  // 低库存警告
  console.log('\n⚠️  库存警告\n')
  let hasWarning = false
  types.forEach(({ key, name }) => {
    const unused = stats[`${key}_unused`] || 0
    if (unused < 20) {
      console.log(`❌ ${name} 库存严重不足！仅剩 ${unused} 个，请立即补货`)
      hasWarning = true
    } else if (unused < 50) {
      console.log(`⚠️  ${name} 库存偏低，剩余 ${unused} 个，建议补货`)
      hasWarning = true
    }
  })

  if (!hasWarning) {
    console.log('✅ 所有类型库存充足')
  }

  console.log('\n' + '═'.repeat(60))
}

async function checkRevenue() {
  const { data, error } = await supabase
    .from('activation_codes')
    .select('type, price, status')
    .in('status', ['active', 'expired'])

  if (error) {
    console.error('❌ 查询失败:', error.message)
    return
  }

  const revenue: Record<string, number> = { total: 0 }
  const count: Record<string, number> = {}

  data.forEach((code: ActivationCode) => {
    const price = code.price || 0
    revenue[code.type] = (revenue[code.type] || 0) + price
    revenue.total += price
    count[code.type] = (count[code.type] || 0) + 1
  })

  console.log('\n💰 收入统计\n')
  console.log('24小时版:\t' + (count['24h'] || 0) + ' 单\t¥' + (revenue['24h'] || 0).toFixed(2))
  console.log('七天版:\t\t' + (count['7d'] || 0) + ' 单\t¥' + (revenue['7d'] || 0).toFixed(2))
  console.log('永久版:\t\t' + (count['lifetime'] || 0) + ' 单\t¥' + (revenue['lifetime'] || 0).toFixed(2))
  console.log('─'.repeat(60))
  console.log('总销售:\t\t' + (count['24h'] || 0 + count['7d'] || 0 + count['lifetime'] || 0) + ' 单\t¥' + revenue.total.toFixed(2))
  console.log('═'.repeat(60))
}

async function checkTodayStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 今日激活数
  const { data: activatedToday, error: error1 } = await supabase
    .from('activation_codes')
    .select('type')
    .gte('activated_at', today.toISOString())

  // 今日使用次数
  const { data: usagesToday, error: error2 } = await supabase
    .from('usage_logs')
    .select('code')
    .gte('used_at', today.toISOString())

  if (error1 || error2) {
    console.error('❌ 查询今日统计失败')
    return
  }

  console.log('\n📅 今日数据\n')
  console.log('今日激活:\t' + (activatedToday?.length || 0) + ' 个')
  console.log('今日使用:\t' + (usagesToday?.length || 0) + ' 次')
  console.log('═'.repeat(60))
}

async function main() {
  console.log('\n🔍 山椒爱拼豆 - 激活码管理系统\n')

  try {
    await checkInventory()
    await checkRevenue()
    await checkTodayStats()

    console.log('\n✅ 查询完成\n')
  } catch (err) {
    console.error('\n❌ 发生错误:', err)
  }
}

main()
