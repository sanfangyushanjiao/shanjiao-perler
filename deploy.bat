@echo off
REM 山椒爱拼豆 - 激活码系统部署脚本 (Windows)
REM 使用方法: deploy.bat

echo ===================================================
echo   山椒爱拼豆 - 激活码系统部署
echo ===================================================
echo.

REM 检查 Node.js
echo 检查依赖...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未安装 Node.js
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未安装 npm
    pause
    exit /b 1
)

node --version
npm --version
echo.

REM 安装依赖
echo 安装依赖...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo 依赖安装失败
    pause
    exit /b 1
)
echo 依赖安装完成
echo.

REM 构建测试
echo 构建测试...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo 构建失败
    pause
    exit /b 1
)
echo 构建成功
echo.

REM 检查环境变量文件
echo 检查环境变量...
if not exist .env (
    echo 警告: 未找到 .env 文件
    echo 请复制 .env.example 并填入 Supabase 配置
    echo.
    echo   copy .env.example .env
    echo   然后编辑 .env 文件
    echo.
)

echo.
echo ===================================================
echo   部署准备完成！
echo ===================================================
echo.
echo 下一步:
echo.
echo 1. 配置 Supabase
echo    - 访问 https://supabase.com/dashboard
echo    - 创建项目并执行 database/schema.sql
echo    - 获取 API 密钥
echo.
echo 2. 配置 Vercel
echo    - 访问 https://vercel.com
echo    - 在项目设置中添加环境变量:
echo      SUPABASE_URL
echo      SUPABASE_ANON_KEY
echo      SUPABASE_SERVICE_KEY
echo.
echo 3. 生成激活码
echo    npm run gen:codes:lifetime
echo.
echo 4. 测试
echo    访问你的网站并使用激活码
echo.
echo 详细文档: ACTIVATION_SYSTEM.md
echo ===================================================
echo.
pause
