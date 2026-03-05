@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo   Supabase 配置向导
echo ═══════════════════════════════════════════════════════
echo.
echo 这个脚本将帮助你完成 Supabase 配置
echo.
echo ═══════════════════════════════════════════════════════
echo   步骤 1: 访问 Supabase
echo ═══════════════════════════════════════════════════════
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 打开浏览器，访问:
echo    https://supabase.com/dashboard
echo.
echo 2. 如果没有账号，点击 "Sign Up" 注册
echo    建议使用 GitHub 账号登录（最快）
echo.
echo 3. 登录后，点击 "New Project" 创建项目
echo.
pause
echo.
echo ═══════════════════════════════════════════════════════
echo   步骤 2: 创建项目
echo ═══════════════════════════════════════════════════════
echo.
echo 填写以下信息：
echo.
echo   Project Name: shanjiao-perler
echo   Database Password: [设置一个强密码并记住]
echo   Region: Singapore (ap-southeast-1) [推荐，速度快]
echo   Pricing Plan: Free [免费版足够使用]
echo.
echo 点击 "Create new project"
echo.
echo ⏰ 等待项目创建完成（约2-3分钟）...
echo.
pause
echo.
echo ═══════════════════════════════════════════════════════
echo   步骤 3: 执行 SQL 脚本
echo ═══════════════════════════════════════════════════════
echo.
echo 项目创建完成后：
echo.
echo 1. 左侧菜单点击 "SQL Editor"
echo 2. 点击 "New query"
echo 3. 打开文件: database\schema.sql
echo 4. 复制所有内容粘贴到 SQL 编辑器
echo 5. 点击右下角 "Run" 按钮
echo 6. 看到 "Success. No rows returned" 表示成功
echo.
echo 📁 我现在帮你打开 schema.sql 文件...
echo.
pause
notepad database\schema.sql
echo.
echo 复制好了吗？
pause
echo.
echo ═══════════════════════════════════════════════════════
echo   步骤 4: 获取 API 密钥
echo ═══════════════════════════════════════════════════════
echo.
echo 1. 左侧菜单点击 "Settings" (齿轮图标)
echo 2. 点击 "API"
echo 3. 找到以下信息：
echo.
echo    Project URL: https://xxxxx.supabase.co
echo    anon public: eyJhbG...（很长的字符串）
echo    service_role: eyJhbG...（很长的字符串，带锁图标）
echo.
echo 4. 点击 service_role 旁边的眼睛图标显示密钥
echo.
pause
echo.
echo ═══════════════════════════════════════════════════════
echo   步骤 5: 填写配置
echo ═══════════════════════════════════════════════════════
echo.
echo 请依次输入（复制粘贴即可）：
echo.

set /p SUPABASE_URL="请输入 Project URL: "
echo.
set /p SUPABASE_ANON_KEY="请输入 anon public key: "
echo.
set /p SUPABASE_SERVICE_KEY="请输入 service_role key: "
echo.

echo ═══════════════════════════════════════════════════════
echo   正在保存配置...
echo ═══════════════════════════════════════════════════════
echo.

(
echo # Supabase 配置
echo # 自动生成于 %date% %time%
echo.
echo SUPABASE_URL=%SUPABASE_URL%
echo SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
echo SUPABASE_SERVICE_KEY=%SUPABASE_SERVICE_KEY%
echo.
echo # 注意事项:
echo # 1. .env 文件不要提交到 Git
echo # 2. SUPABASE_SERVICE_KEY 必须保密
echo # 3. 在 Vercel 中也需要配置这些环境变量
) > .env

echo ✅ 配置已保存到 .env 文件
echo.
echo ═══════════════════════════════════════════════════════
echo   验证配置
echo ═══════════════════════════════════════════════════════
echo.
echo 检查配置是否正确...
type .env
echo.
echo ═══════════════════════════════════════════════════════
echo   完成！
echo ═══════════════════════════════════════════════════════
echo.
echo ✅ Supabase 配置完成
echo ✅ 数据库表已创建
echo ✅ 配置已保存
echo.
echo 下一步：生成激活码
echo.
echo 按任意键继续生成激活码...
pause >nul

echo.
echo ═══════════════════════════════════════════════════════
echo   生成激活码
echo ═══════════════════════════════════════════════════════
echo.

echo 正在生成 50 个永久版激活码...
call npm run gen:codes:lifetime -- --count 50
echo.

echo 正在生成 100 个七天版激活码...
call npm run gen:codes:7d -- --count 100
echo.

echo 正在生成 200 个24小时版激活码...
call npm run gen:codes:24h -- --count 200
echo.

echo ═══════════════════════════════════════════════════════
echo   大功告成！
echo ═══════════════════════════════════════════════════════
echo.
echo ✅ 激活码已生成
echo ✅ CSV 文件已导出
echo.
echo 文件位置：
dir /b activation-codes-*.csv
echo.
echo 下一步：配置发卡平台
echo 请查看文档：YIZHIFU_SETUP_GUIDE.md
echo.
pause
