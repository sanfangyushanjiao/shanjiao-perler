# Vercel 环境变量配置指南

## 问题诊断

你发现生产环境（https://shanjiao-perler.vercel.app/）没有激活码功能，而本地开发环境（localhost:5175/5176）有该功能。

**原因**：激活码系统依赖 Supabase 数据库，需要在 Vercel 配置环境变量才能正常工作。

## 解决方案：配置 Vercel 环境变量

### 第一步：获取 Supabase 凭证

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目（shanjiao-perler）
3. 点击左侧菜单 **Settings** → **API**
4. 复制以下信息：
   - **Project URL** (类似: `https://xxxxx.supabase.co`)
   - **service_role key** (anon key 权限不够，必须用 service_role key)

### 第二步：在 Vercel 配置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到并进入 **shanjiao-perler** 项目
3. 点击顶部菜单 **Settings**
4. 点击左侧菜单 **Environment Variables**
5. 添加以下两个环境变量：

#### 变量 1: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://xxxxx.supabase.co  (替换为你的实际 URL)
Environment: Production, Preview, Development (全选)
```

#### 变量 2: SUPABASE_SERVICE_KEY
```
Name: SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...  (替换为你的实际 key)
Environment: Production, Preview, Development (全选)
```

⚠️ **重要提示**：
- 必须使用 `service_role` key，不要用 `anon` key
- service_role key 拥有完整的数据库读写权限
- 这些环境变量只在服务器端可见，前端代码无法访问

### 第三步：重新部署

配置完环境变量后，Vercel 不会自动重新部署，你需要手动触发：

**方式 1：通过 Vercel Dashboard**
1. 在项目页面，点击顶部 **Deployments** 标签
2. 找到最新的部署记录
3. 点击右侧的 **⋯** 菜单
4. 选择 **Redeploy**

**方式 2：通过推送代码**
```bash
cd /c/Users/ASUS/shanjiao-perler
git commit --allow-empty -m "chore: trigger Vercel redeploy"
git push
```

### 第四步：验证激活码功能

1. 等待 Vercel 部署完成（约 1-2 分钟）
2. 访问 https://shanjiao-perler.vercel.app/
3. 应该会看到激活码输入界面
4. 测试输入一个有效的激活码（从你的数据库获取）

## 当前代码状态

✅ **激活码系统已完整实现**
- ✅ 前端组件：ActivationModal, ActivationStatus
- ✅ 状态管理：AuthContext (localStorage 持久化)
- ✅ 后端 API：/api/verify-code
- ✅ 代码已推送到 GitHub (commit a1c668a + 18a908e)
- ✅ 50/50 测试通过
- ✅ 构建成功

唯一缺少的就是 Vercel 环境变量配置！

## 移动端优化（已完成）

刚刚完成的优化 (commit 18a908e)：

### 1. 导出图片颜色统计区域
- ✅ 标题字体增大到 56px
- ✅ 颜色方块增大到 70px
- ✅ 色号字体增大到 32px（加粗）
- ✅ 数量字体增大到 28px
- ✅ 行间距增加到 100px
- ✅ 所有间距全面优化

### 2. 移动端保存提示
- ✅ 改为双行清晰提示（标题+说明）
- ✅ 延长显示时间到 4 秒
- ✅ 更大更清晰的字体

### 3. 保存到相册
- ✅ Web Share API 支持文件分享
- ✅ 改进下载机制兼容性
- ✅ 更好的用户提示

## 常见问题

### Q: 为什么本地有激活码功能但生产环境没有？
A: 本地开发时，环境变量从项目根目录的 `.env` 文件读取。生产环境必须在 Vercel Dashboard 手动配置。

### Q: 配置完环境变量后还是没有激活码界面？
A: 检查以下几点：
1. 环境变量名称是否完全正确（区分大小写）
2. 是否选择了 Production 环境
3. 是否重新部署了项目
4. 浏览器是否有缓存（Ctrl+Shift+R 强制刷新）

### Q: 激活码验证失败怎么办？
A: 检查：
1. Supabase 数据库表 `activation_codes` 是否存在
2. 表结构是否正确（参考 `database/schema.sql`）
3. 是否有可用的激活码（status = 'unused' 或 'active'）
4. Vercel Function Logs 查看详细错误信息

### Q: 移动端导出的图片还是看不清？
A: 确保：
1. 已部署最新代码（commit 18a908e）
2. 清除浏览器缓存
3. 字体已增大到：标题 56px，色号 32px，数量 28px，色块 70px

## 技术细节

### API 端点
```
POST /api/verify-code
Body: { "code": "SJ-XXXX-XXXX-XXXX" }
Response: {
  "success": true,
  "type": "24h" | "7d" | "lifetime",
  "activatedAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-02T00:00:00.000Z" | null
}
```

### 本地测试 API
```bash
cd /c/Users/ASUS/shanjiao-perler
npm run dev:api  # 启动本地 API 服务器（端口 3001）
npm run dev      # 启动前端开发服务器（端口 5173）
```

### 查看 Vercel 部署日志
1. Vercel Dashboard → Deployments
2. 点击最新部署记录
3. 点击 **Building** 或 **Function Logs** 查看日志
4. 如果 API 报错，会显示详细的错误堆栈

## 下一步

1. ⏳ **立即配置 Vercel 环境变量**（5 分钟）
2. ⏳ **重新部署项目**（2 分钟）
3. ⏳ **测试激活码功能**（1 分钟）
4. ✅ **享受完整的付费功能！**

配置完成后，你的生产环境将拥有完整的激活码付费系统，移动端导出体验也已优化到最佳！
