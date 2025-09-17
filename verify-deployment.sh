#!/bin/bash

# SGA Workspace Dify 版本 - 部署验证脚本
# 确保所有功能正常工作

set -e

echo "🔍 SGA Workspace Dify 版本 - 部署验证"
echo "================================================"

# 检查服务状态
echo "📊 检查 Docker 服务状态..."
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ 服务未正常运行，请先启动服务"
    echo "运行: docker-compose up -d"
    exit 1
fi
echo "✅ Docker 服务运行正常"

# 检查应用健康状态
echo "🏥 检查应用健康状态..."
if ! curl -f http://localhost:8100/api/health &> /dev/null; then
    echo "❌ 应用健康检查失败"
    echo "请检查应用日志: docker-compose logs app"
    exit 1
fi
echo "✅ 应用健康状态正常"

# 检查数据库连接
echo "🗄️ 检查数据库连接..."
if ! docker-compose exec -T app npm run db:status &> /dev/null; then
    echo "❌ 数据库连接失败"
    echo "请检查数据库服务: docker-compose logs postgres"
    exit 1
fi
echo "✅ 数据库连接正常"

# 检查管理员账户
echo "👤 检查管理员账户..."
if docker-compose exec -T app npm run check-admin 2>/dev/null | grep -q "管理员账户已存在"; then
    echo "✅ 管理员账户存在"
else
    echo "⚠️  管理员账户不存在，正在创建..."
    docker-compose exec -T app npm run init-admin
    echo "✅ 管理员账户创建完成"
fi

# 检查关键文件
echo "📁 检查关键文件..."
critical_files=(
    "app/components/enhanced-chat-with-sidebar.tsx"
    "app/api/dify-chat/route.ts"
    "app/api/proxy-image/route.ts"
    "lib/enhanced-dify-client.ts"
    "docker-compose.yml"
    ".env"
)

for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 关键文件缺失: $file"
        exit 1
    fi
done
echo "✅ 所有关键文件存在"

# 检查端口占用
echo "🔌 检查端口占用..."
ports=(8100 5433 6380)
for port in "${ports[@]}"; do
    if ! netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo "⚠️  端口 $port 未被占用，服务可能未启动"
    else
        echo "✅ 端口 $port 正常监听"
    fi
done

# 测试图片代理 API
echo "🖼️ 测试图片代理 API..."
if curl -f "http://localhost:8100/api/proxy-image?url=https://via.placeholder.com/150" -o /dev/null -s; then
    echo "✅ 图片代理 API 正常"
else
    echo "⚠️  图片代理 API 可能有问题"
fi

# 检查 Dify 集成配置
echo "🤖 检查 Dify 集成配置..."
if docker-compose exec -T app node -e "
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
if (env.includes('DIFY_URL') || env.includes('difyUrl')) {
    console.log('✅ Dify 配置存在');
} else {
    console.log('⚠️  Dify 配置可能缺失');
}
" 2>/dev/null; then
    echo "Dify 配置检查完成"
else
    echo "⚠️  无法检查 Dify 配置"
fi

# 显示验证结果
echo ""
echo "🎉 部署验证完成！"
echo "================================================"
echo "📱 应用访问地址: http://localhost:8100"
echo "👤 管理员登录: http://localhost:8100/auth/login"
echo "🔧 管理员面板: http://localhost:8100/admin"
echo "🤖 Agent 管理: http://localhost:8100/admin/agents"
echo ""
echo "📋 下一步操作："
echo "1. 访问管理员面板配置 Dify Agent"
echo "2. 设置 difyUrl 和 difyKey 参数"
echo "3. 测试对话和图片生成功能"
echo "4. 检查历史消息图片显示"
echo ""
echo "🔍 如遇问题，请查看："
echo "- 应用日志: docker-compose logs -f app"
echo "- 服务状态: docker-compose ps"
echo "- 部署指南: DIFY_DEPLOYMENT_GUIDE.md"
echo "================================================"
