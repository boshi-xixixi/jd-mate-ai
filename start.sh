#!/bin/bash

# JD Mate AI 启动脚本

echo "🚀 启动 JD Mate AI..."

# 进入项目目录
cd "$(dirname "$0")"

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
fi

# 检查 .env.local 是否存在
if [ ! -f ".env.local" ]; then
    echo "⚠️  未找到 .env.local 文件"
    echo "📝 正在从 .env.example 创建..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ 已创建 .env.local，请根据需要修改配置"
    fi
fi

# 清除缓存并启动
echo "🧹 清除 .next 缓存..."
rm -rf .next

echo "🌟 启动开发服务器..."
npm run dev
