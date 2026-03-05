@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo   保存 Supabase 配置到 .env 文件
echo ═══════════════════════════════════════════════════════
echo.
echo 请粘贴网页向导弹窗中显示的配置信息
echo （从 SUPABASE_URL 开始，到 SUPABASE_SERVICE_KEY 结束）
echo.
echo 示例格式：
echo SUPABASE_URL=https://xxxxx.supabase.co
echo SUPABASE_ANON_KEY=eyJhbGc...
echo SUPABASE_SERVICE_KEY=eyJhbGc...
echo.
echo ═══════════════════════════════════════════════════════
echo.

set /p SUPABASE_URL="请输入 SUPABASE_URL (粘贴完整行): "
echo.

set /p SUPABASE_ANON_KEY="请输入 SUPABASE_ANON_KEY (粘贴完整行): "
echo.

set /p SUPABASE_SERVICE_KEY="请输入 SUPABASE_SERVICE_KEY (粘贴完整行): "
echo.

echo ═══════════════════════════════════════════════════════
echo   正在保存配置...
echo ═══════════════════════════════════════════════════════
echo.

(
echo # Supabase 配置
echo # 保存于 %date% %time%
echo.
echo %SUPABASE_URL%
echo %SUPABASE_ANON_KEY%
echo %SUPABASE_SERVICE_KEY%
echo.
echo # 注意事项:
echo # 1. .env 文件不要提交到 Git
echo # 2. SUPABASE_SERVICE_KEY 必须保密
echo # 3. 在 Vercel 中也需要配置这些环境变量
) > .env

echo ✅ 配置已保存到 .env 文件
echo.
type .env
echo.
echo ═══════════════════════════════════════════════════════
echo   开始生成激活码
echo ═══════════════════════════════════════════════════════
echo.
pause

echo.
echo 🔄 正在生成 50 个永久版激活码...
call npm run gen:codes:lifetime

echo.
echo 🔄 正在生成 100 个七天版激活码...
call npm run gen:codes:7d

echo.
echo 🔄 正在生成 200 个24小时版激活码...
call npm run gen:codes:24h

echo.
echo ═══════════════════════════════════════════════════════
echo   完成！
echo ═══════════════════════════════════════════════════════
echo.
echo ✅ 激活码已生成并保存
echo.
echo 📁 查看生成的 CSV 文件：
dir /b activation-codes-*.csv 2>nul
echo.
echo 这些 CSV 文件就是要上传到发卡平台的！
echo.
echo 下一步：配置发卡平台
echo 请查看文档：YIZHIFU_SETUP_GUIDE.md
echo.
pause
