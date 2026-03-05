# 🚀 一键配置指南

## ✅ 我已经为你准备好了自动化脚本！

### 📁 文件位置
```
C:\Users\ASUS\shanjiao-perler\setup-supabase.bat
```

---

## 🎯 使用方法（超级简单）

### 方法一：双击运行（推荐）

1. **打开文件夹**
   - 按 `Win + E` 打开文件资源管理器
   - 导航到：`C:\Users\ASUS\shanjiao-perler`

2. **找到并双击**
   - 找到文件：`setup-supabase.bat`
   - 双击运行

3. **按照提示操作**
   - 脚本会一步步引导你
   - 需要你做的只是复制粘贴

---

### 方法二：命令行运行

```bash
cd C:\Users\ASUS\shanjiao-perler
setup-supabase.bat
```

---

## 📋 脚本会自动帮你完成什么？

✅ **打开必要的文件** - 自动打开 schema.sql
✅ **引导注册 Supabase** - 提供详细步骤
✅ **收集配置信息** - 你只需复制粘贴
✅ **自动保存配置** - 写入 .env 文件
✅ **生成激活码** - 自动生成 3 种类型的激活码
✅ **导出 CSV** - 准备好上传到发卡平台

---

## 🎬 你需要准备的（提前准备好，更快）

在运行脚本前，请准备：

1. **浏览器** - 打开 https://supabase.com
2. **GitHub 账号**（可选）- 用于快速登录 Supabase
3. **邮箱** - 如果不用 GitHub 登录
4. **笔记本** - 记录数据库密码

---

## 🎯 脚本运行流程预览

```
启动脚本
  ↓
[步骤 1] 引导你访问 Supabase 并注册
  ↓
[步骤 2] 引导你创建项目
  ↓
[步骤 3] 自动打开 schema.sql，你复制粘贴到 Supabase
  ↓
[步骤 4] 引导你获取 API 密钥
  ↓
[步骤 5] 你粘贴密钥，脚本自动保存到 .env
  ↓
[步骤 6] 自动生成 350 个激活码
  ↓
[步骤 7] 自动导出 3 个 CSV 文件
  ↓
完成！✅
```

**总耗时**: 约 10-15 分钟（其中 Supabase 创建项目需要 2-3 分钟）

---

## ⚡ 现在开始！

### 选项 A：我现在就运行脚本
```
1. 打开文件夹 C:\Users\ASUS\shanjiao-perler
2. 双击 setup-supabase.bat
3. 按照屏幕提示操作
4. 遇到问题随时告诉我
```

### 选项 B：我想先看看脚本做什么
```
右键 setup-supabase.bat → 编辑
查看脚本内容（纯文本，安全）
```

### 选项 C：我想手动配置（更灵活）
```
告诉我，我提供详细的手动步骤
```

---

## 🆘 如果遇到问题

### 问题 1: 双击脚本闪退
**解决**: 右键 → 以管理员身份运行

### 问题 2: 提示找不到 npm
**解决**:
```bash
# 检查 Node.js 是否安装
node --version
npm --version

# 如果未安装，访问 https://nodejs.org 下载安装
```

### 问题 3: Supabase 注册失败
**解决**:
- 使用 GitHub 账号登录（最快）
- 或使用邮箱注册
- 确保网络连接正常

### 问题 4: SQL 执行失败
**解决**:
- 确保完整复制了 schema.sql 的所有内容
- 检查是否有额外的空格或换行
- 重新复制粘贴

---

## 📸 关键步骤截图指南

### Supabase 注册页面
```
看到 "Sign Up" 按钮 → 点击
选择 "Continue with GitHub" 或 "Sign up with email"
```

### 创建项目页面
```
看到 "New Project" 按钮 → 点击
填写：
  Name: shanjiao-perler
  Database Password: [你设置的密码]
  Region: Southeast Asia (Singapore)
点击 "Create new project"
```

### SQL 编辑器
```
左侧菜单 "SQL Editor" → "New query"
粘贴 schema.sql 内容
点击 "Run"
看到 "Success" 即成功
```

### API 密钥页面
```
左侧菜单 "Settings" → "API"
复制三个值：
  - Project URL
  - anon public
  - service_role（点击眼睛图标显示）
```

---

## ✅ 完成后你会得到

```
C:\Users\ASUS\shanjiao-perler\
├── .env （已配置好 Supabase）
├── activation-codes-24h-batch-xxxxx.csv （200个24小时码）
├── activation-codes-7d-batch-xxxxx.csv （100个7天码）
└── activation-codes-lifetime-batch-xxxxx.csv （50个永久码）
```

**这些 CSV 文件就是要上传到发卡平台的！**

---

## 🎯 准备好了吗？

**请选择**：

**A** - 我现在运行脚本，开始配置
**B** - 我遇到了问题：[描述问题]
**C** - 我想更改某个设置：[说明需求]

告诉我你的选择，我继续指导你！🚀
