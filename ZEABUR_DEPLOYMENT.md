# Zeabur 部署指南

## 项目已配置为 Zeabur 部署

### 部署步骤

1. **注册 Zeabur 账号**
   - 访问：https://zeabur.com/
   - 使用 GitHub 账号登录（推荐）

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub"
   - 授权 Zeabur 访问你的 GitHub
   - 选择 `shanjiao-perler` 仓库

3. **配置环境变量**
   - 在项目设置中添加环境变量：
     - `SUPABASE_URL`: https://gaazmwlzlqnhdjlzgtnz.supabase.co
     - `SUPABASE_SERVICE_KEY`: (你的 service key)

4. **部署**
   - Zeabur 会自动检测配置并部署
   - 等待部署完成（约 2-3 分钟）

5. **获取访问链接**
   - 部署成功后，Zeabur 会提供一个 `.zeabur.app` 域名
   - 国内可直接访问

### 特性支持

✅ 静态文件托管
✅ Serverless Functions（API 路由）
✅ 自动 HTTPS
✅ 环境变量
✅ 自动构建部署
✅ 国内直连访问

### 注意事项

- Zeabur 免费额度：每月 $5 免费额度
- API 路由会自动识别 `api/` 目录
- 支持自定义域名绑定
