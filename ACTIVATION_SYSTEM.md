# 山椒爱拼豆 - 激活码系统部署指南

## 📋 系统概述

本系统实现了基于激活码的付费访问控制，支持三种使用期限：
- **24小时使用权**: ¥1.8
- **七天使用权**: ¥6.6
- **永久使用权**: ¥9.9

用户输入激活码后即可使用，同一激活码可跨设备使用。

---

## 🚀 快速开始

### 步骤 1: Supabase 数据库设置

#### 1.1 创建 Supabase 项目

1. 访问 https://supabase.com 并注册/登录
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `shanjiao-perler`
   - Database Password: 设置一个强密码（保存好）
   - Region: 选择离用户最近的区域（建议选择新加坡）
4. 等待项目创建完成（约2分钟）

#### 1.2 执行数据库脚本

1. 在 Supabase 项目页面，点击左侧菜单 "SQL Editor"
2. 点击 "New query"
3. 复制 `database/schema.sql` 的全部内容并粘贴
4. 点击 "Run" 执行脚本
5. 确认表创建成功（应该看到成功消息）

#### 1.3 获取 API 密钥

1. 点击左侧菜单 "Settings" → "API"
2. 找到以下信息并保存：
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGc...`（一个很长的字符串）
   - **service_role key**: `eyJhbGc...`（另一个长字符串，⚠️ 保密）

---

### 步骤 2: Vercel 部署配置

#### 2.1 配置环境变量

1. 访问 https://vercel.com 并登录
2. 进入你的项目 (shanjiao-perler)
3. 点击 "Settings" → "Environment Variables"
4. 添加以下环境变量：

```bash
# Supabase 配置
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

**重要提示**:
- 确保没有多余的空格
- `SUPABASE_SERVICE_KEY` 必须保密，不要泄露
- 设置后需要重新部署才能生效

#### 2.2 重新部署

1. 方法一（推荐）：在本地推送代码
   ```bash
   cd shanjiao-perler
   git add .
   git commit -m "feat: 添加激活码系统"
   git push origin main
   ```

2. 方法二：在 Vercel 手动触发部署
   - 进入项目
   - 点击 "Deployments"
   - 点击 "Redeploy"

3. 等待部署完成（约2-3分钟）

#### 2.3 验证部署

部署完成后，访问你的网站应该会看到激活码输入界面。

---

### 步骤 3: 生成激活码

#### 3.1 配置本地环境

在项目根目录创建 `.env` 文件（⚠️ 不要提交到 Git）:

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
```

#### 3.2 生成激活码

使用以下命令生成激活码：

```bash
# 生成 100 个 24小时激活码
npm run gen:codes:24h

# 生成 50 个 七天激活码
npm run gen:codes:7d

# 生成 20 个 永久激活码
npm run gen:codes:lifetime
```

自定义数量和批次ID：
```bash
tsx scripts/generate-codes.ts --type 24h --count 200 --batch promo-2024
```

#### 3.3 输出结果

脚本会：
1. 在数据库中创建激活码记录
2. 在项目根目录生成 CSV 文件: `activation-codes-{type}-{batch}.csv`

CSV 格式示例：
```csv
code,type,price
SJ-A1B2-C3D4-E5F6,24h,1.80
SJ-B2C3-D4E5-F6A7,7d,6.60
SJ-C3D4-E5F6-A7B8,lifetime,9.90
```

---

### 步骤 4: 发卡平台配置

#### 4.1 选择发卡平台

推荐平台：

| 平台 | 优点 | 手续费 | 适用场景 |
|------|------|--------|----------|
| **易支付** | 接入简单，支持支付宝/微信 | 0.38% | 推荐初学者 |
| **发卡网** | 免费，功能齐全 | 免费 | 预算有限 |
| **码支付** | 稳定，接口丰富 | 0.5% | 大规模销售 |

#### 4.2 创建商品（以易支付为例）

1. 登录发卡平台
2. 点击 "商品管理" → "添加商品"
3. 创建三个商品：

**商品 1: 24小时使用权**
- 商品名称: `山椒爱拼豆 24小时使用权`
- 售价: `1.8`
- 商品类型: `卡密`
- 发货方式: `自动发货`

**商品 2: 七天使用权**
- 商品名称: `山椒爱拼豆 七天使用权`
- 售价: `6.6`
- 商品类型: `卡密`
- 发货方式: `自动发货`

**商品 3: 永久使用权** ⭐
- 商品名称: `山椒爱拼豆 永久使用权`
- 售价: `9.9`
- 商品类型: `卡密`
- 发货方式: `自动发货`
- 标签: `推荐`

#### 4.3 上传激活码

1. 进入商品详情
2. 点击 "卡密管理" → "批量导入"
3. 上传对应的 CSV 文件
4. 确认导入成功

#### 4.4 配置发货模板

在发货模板中设置：

```
🎉 感谢购买山椒爱拼豆！

━━━━━━━━━━━━━━━━━━
📝 激活码: {code}
⏰ 有效期: {type}
━━━━━━━━━━━━━━━━━━

使用方法:
1. 访问 https://shanjiao-perler.vercel.app
2. 输入上方激活码
3. 开始制作拼豆图纸

💡 提示:
• 激活码可在多个设备使用
• 建议保存好激活码
• 有问题请联系客服

祝您使用愉快！ 🎨
```

#### 4.5 获取购买链接

1. 复制商品购买链接（类似: `https://xxx.com/buy/12345`）
2. 更新前端代码中的购买链接：

编辑 `src/components/Auth/ActivationModal.tsx`:
```typescript
const PURCHASE_URL = 'https://你的发卡平台链接';
```

---

### 步骤 5: 电商平台上架（可选）

#### 5.1 淘宝/拼多多

由于平台限制，采用引导方式：

**商品标题**:
```
拼豆图纸生成工具使用权 自动发货 24小时/7天/永久
```

**商品描述**:
```
【产品说明】
本商品为虚拟软件使用权，购买后自动发货激活码。

【使用步骤】
1. 拍下商品并付款
2. 自助领取激活码（见下方链接）
3. 访问 https://shanjiao-perler.vercel.app
4. 输入激活码即可使用

【自助领取】
发卡平台: [你的发卡平台链接]

【套餐选择】
• 24小时体验版: ¥1.8
• 七天标准版: ¥6.6
• 永久专业版: ¥9.9（推荐）

【产品特点】
✓ 自动发货，即买即用
✓ 一码多设备使用
✓ 无需注册，输入即用
✓ 功能完整，无限制

【联系客服】
如有问题，请联系旺旺客服
```

#### 5.2 设置自动回复

**淘宝旺旺自动回复**:
```
您好！感谢购买~

激活码自助领取:
[发卡平台链接]

使用方法:
1. 点击上方链接获取激活码
2. 访问 https://shanjiao-perler.vercel.app
3. 输入激活码
4. 开始使用

有问题随时联系客服哦！ 😊
```

#### 5.3 闲鱼发布

闲鱼发布文案：
```
【标题】
拼豆图纸生成工具 24小时/7天/永久使用权 自动发货

【描述】
🎨 山椒爱拼豆 - 专业拼豆图纸生成工具

✨ 功能特点:
• 智能图片转拼豆图纸
• 多品牌拼豆珠支持
• 一键导出购物清单
• 手动编辑功能

💰 价格套餐:
• 24小时体验: ¥1.8
• 七天标准: ¥6.6
• 永久专业: ¥9.9 🔥

⚡ 购买流程:
1. 拍下并备注套餐类型
2. 联系卖家获取激活码
3. 访问网站输入激活码
4. 立即开始使用

📱 可多设备使用，一次购买全平台通用！
```

---

## 🧪 测试清单

在正式上线前，请完成以下测试：

### 前端测试

- [ ] 首次访问显示激活弹窗
- [ ] 输入格式错误的激活码显示错误提示
- [ ] 输入不存在的激活码显示 "激活码不存在"
- [ ] 输入正确激活码成功激活
- [ ] 激活后显示剩余时间
- [ ] 刷新页面保持激活状态
- [ ] 点击状态按钮显示详情
- [ ] 退出登录返回激活界面

### 激活码测试

- [ ] 24小时码在24小时后自动过期
- [ ] 7天码在7天后自动过期
- [ ] 永久码不会过期
- [ ] 同一激活码可在不同设备使用
- [ ] 已过期码无法重新激活

### API 测试

- [ ] 速率限制生效（连续5次失败后限制）
- [ ] 数据库正确记录使用日志
- [ ] 激活码状态正确更新
- [ ] 错误处理正常工作

### 支付流程测试

- [ ] 发卡平台自动发货
- [ ] 激活码格式正确
- [ ] CSV 导入成功
- [ ] 购买链接可访问

---

## 📊 数据库查询示例

### 查看激活码统计

```sql
-- 按状态统计
SELECT status, COUNT(*) as count
FROM activation_codes
GROUP BY status;

-- 按类型统计
SELECT type, COUNT(*) as count
FROM activation_codes
GROUP BY type;

-- 查看最近激活的码
SELECT code, type, activated_at
FROM activation_codes
WHERE status = 'active'
ORDER BY activated_at DESC
LIMIT 10;
```

### 查看使用日志

```sql
-- 最近使用记录
SELECT code, ip_address, used_at
FROM usage_logs
ORDER BY used_at DESC
LIMIT 20;

-- 按IP统计使用次数
SELECT ip_address, COUNT(*) as usage_count
FROM usage_logs
GROUP BY ip_address
ORDER BY usage_count DESC;
```

### 查找即将过期的码

```sql
SELECT code, type, expires_at
FROM activation_codes
WHERE status = 'active'
  AND expires_at IS NOT NULL
  AND expires_at < NOW() + INTERVAL '24 hours'
ORDER BY expires_at;
```

---

## 🔧 常见问题

### Q1: 激活码验证失败怎么办？

**检查清单**:
1. 确认 Vercel 环境变量已正确设置
2. 确认 Supabase 数据库表已创建
3. 检查 API 端点是否可访问: `/api/verify-code`
4. 查看 Vercel 部署日志是否有错误

### Q2: 生成激活码脚本报错？

**可能原因**:
- 环境变量未设置: 检查 `.env` 文件
- Supabase 连接失败: 检查 URL 和 KEY 是否正确
- 数据库表不存在: 重新执行 `schema.sql`

### Q3: 激活后刷新页面又回到登录界面？

**解决方案**:
- 检查浏览器是否禁用 localStorage
- 检查是否在隐私/无痕模式
- 清除浏览器缓存后重试

### Q4: 如何批量查看未使用的激活码？

```sql
SELECT code, type, price, batch_id, created_at
FROM activation_codes
WHERE status = 'unused'
ORDER BY created_at DESC;
```

### Q5: 如何作废某个激活码？

```sql
UPDATE activation_codes
SET status = 'expired'
WHERE code = 'SJ-XXXX-XXXX-XXXX';
```

---

## 📈 运营建议

### 定价策略

1. **体验版 (24小时)**: 吸引新用户尝试
2. **标准版 (7天)**: 短期项目使用
3. **专业版 (永久)**: 重度用户，利润主要来源

### 促销活动

- 限时折扣（节假日）
- 批量购买优惠
- 推荐返利机制
- 老用户续费优惠

### 数据分析

定期检查：
- 各套餐销售占比
- 用户平均使用时长
- 转化率（体验版→永久版）
- 热门使用时段

---

## 🚨 安全注意事项

1. **保护 Service Key**:
   - 永远不要提交到 Git
   - 不要在前端代码中使用
   - 定期轮换密钥

2. **防止滥用**:
   - API 已实现速率限制
   - 监控异常IP访问
   - 定期检查使用日志

3. **数据备份**:
   - Supabase 自动每日备份
   - 定期导出激活码数据
   - 保存重要批次的 CSV 文件

---

## 📞 技术支持

如果遇到问题：

1. 查看本文档的常见问题部分
2. 检查 Vercel 部署日志
3. 查看 Supabase 数据库日志
4. 访问项目 GitHub Issues: https://github.com/sanfangyushanjiao/shanjiao-perler/issues

---

## 📝 更新日志

### v1.0.0 (2026-03-05)
- ✅ 初始版本发布
- ✅ 三种套餐支持
- ✅ 激活码生成系统
- ✅ 自动发货集成
- ✅ 跨设备使用支持

---

## 🎯 后续优化方向

### 短期 (1-3个月)
- [ ] 激活码使用统计面板
- [ ] 管理后台（销售数据可视化）
- [ ] 邀请返利系统
- [ ] 续费优惠功能

### 中期 (3-6个月)
- [ ] 直连支付宝/微信支付
- [ ] 用户反馈系统
- [ ] 邮件/短信通知
- [ ] 优惠券系统

### 长期 (6-12个月)
- [ ] 订阅制（月付/年付）
- [ ] 企业版（团队协作）
- [ ] API 开放平台
- [ ] 移动端 App

---

**祝您运营顺利！** 🎉
