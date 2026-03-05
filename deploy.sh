#!/bin/bash

# 山椒爱拼豆 - 激活码系统部署脚本
# 使用方法: bash deploy.sh

set -e

echo "═══════════════════════════════════════════════════════"
echo "  山椒爱拼豆 - 激活码系统部署"
echo "═══════════════════════════════════════════════════════"
echo ""

# 检查依赖
echo "📦 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未安装 npm"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm install
echo "✅ 依赖安装完成"
echo ""

# 构建测试
echo "🔨 构建测试..."
npm run build
echo "✅ 构建成功"
echo ""

# 检查环境变量文件
echo "🔍 检查环境变量..."
if [ ! -f .env ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    echo "   请复制 .env.example 并填入 Supabase 配置"
    echo ""
    echo "   cp .env.example .env"
    echo "   编辑 .env 文件"
    echo ""
fi

# Git 检查
echo "📝 检查 Git 状态..."
if [ -d .git ]; then
    echo "✅ Git 仓库已初始化"

    # 显示未提交的更改
    if [[ -n $(git status -s) ]]; then
        echo ""
        echo "未提交的更改:"
        git status -s
        echo ""

        read -p "是否提交并推送这些更改? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            read -p "提交信息: " commit_msg
            git commit -m "$commit_msg"
            git push origin main
            echo "✅ 代码已推送"
        fi
    else
        echo "✅ 没有未提交的更改"
    fi
else
    echo "⚠️  警告: 不是 Git 仓库"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  部署准备完成！"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "下一步:"
echo ""
echo "1. 配置 Supabase"
echo "   - 访问 https://supabase.com/dashboard"
echo "   - 创建项目并执行 database/schema.sql"
echo "   - 获取 API 密钥"
echo ""
echo "2. 配置 Vercel"
echo "   - 访问 https://vercel.com"
echo "   - 在项目设置中添加环境变量:"
echo "     SUPABASE_URL"
echo "     SUPABASE_ANON_KEY"
echo "     SUPABASE_SERVICE_KEY"
echo ""
echo "3. 生成激活码"
echo "   npm run gen:codes:lifetime -- --count 10"
echo ""
echo "4. 测试"
echo "   访问你的网站并使用激活码"
echo ""
echo "详细文档: ACTIVATION_SYSTEM.md"
echo "═══════════════════════════════════════════════════════"
