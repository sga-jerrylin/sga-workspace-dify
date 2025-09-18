#!/bin/bash

# 🚀 应用启动脚本
# 负责数据库初始化和应用启动

set -e

echo "🔄 正在启动应用..."

# 等待数据库准备就绪
echo "⏳ 等待数据库连接..."
npx wait-on tcp:postgres:5432 -t 30000

# 生成Prisma客户端
echo "🔧 生成Prisma客户端..."
npx prisma generate

# 同步数据库schema（开发环境使用db push）
echo "📊 同步数据库schema..."
npx prisma db push --accept-data-loss

echo "✅ 数据库初始化完成！"

# 启动应用
echo "🚀 启动Next.js应用..."
exec npm run dev
