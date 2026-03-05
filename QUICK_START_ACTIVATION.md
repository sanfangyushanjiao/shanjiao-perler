# 激活码系统 - 快速开始

## 🎯 5分钟快速部署

### 前置要求
- ✅ GitHub 账号
- ✅ Vercel 账号
- ✅ Supabase 账号

---

## 步骤 1: 创建 Supabase 项目（3分钟）

1. 访问 https://supabase.com/dashboard
2. 点击 **"New Project"**
3. 填写信息：
   ```
   项目名称: shanjiao-perler
   数据库密码: [设置强密码]
   区域: Singapore (ap-southeast-1)
   ```
4. 等待创建完成

### 执行 SQL

1. 左侧菜单 → **SQL Editor**
2. 点击 **"New query"**
3. 粘贴 `database/schema.sql` 的内容
4. 点击 **RUN**

### 获取密钥

Settings → API → 复制以下内容：
- ✅ Project URL
- ✅ anon public key
- ✅ service_role key (⚠️ 保密)

---

## 步骤 2: 配置 Vercel（2分钟）

### 设置环境变量

Vercel 项目 → Settings → Environment Variables

添加：
```bash
SUPABASE_URL=你的项目URL
SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_KEY=你的service密钥
```

### 重新部署

```bash
git add .
git commit -m "feat: 添加激活码系统"
git push origin main
```

---

## 步骤 3: 生成激活码（1分钟）

### 本地配置

创建 `.env` 文件：
```bash
SUPABASE_URL=你的项目URL
SUPABASE_SERVICE_KEY=你的service密钥
```

### 生成

```bash
# 生成 10 个测试码（永久版）
tsx scripts/generate-codes.ts --type lifetime --count 10
```

---

## ✅ 完成！

访问你的网站，应该会看到激活码输入界面。

使用刚才生成的激活码测试！

---

## 🆘 遇到问题？

### 问题 1: API 返回 500 错误
**解决**: 检查 Vercel 环境变量是否正确设置

### 问题 2: 数据库连接失败
**解决**: 确认 SQL 脚本已执行，表已创建

### 问题 3: 激活码生成失败
**解决**: 检查 `.env` 文件是否存在且配置正确

---

## 📚 详细文档

查看 `ACTIVATION_SYSTEM.md` 获取完整指南。
