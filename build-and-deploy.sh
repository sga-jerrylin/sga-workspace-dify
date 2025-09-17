#!/bin/bash

# SGA Workspace Dify 版本 - 构建和部署脚本
# 确保在任何机器上都能完整运行

set -e

echo "🚀 SGA Workspace Dify 版本 - 自动部署脚本"
echo "================================================"

# 检查 Docker 和 Docker Compose
echo "📋 检查系统环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ 已从 .env.example 创建 .env 文件"
        echo "⚠️  请编辑 .env 文件配置必要参数"
    else
        echo "❌ 未找到 .env.example 文件"
        exit 1
    fi
fi

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down || true

# 清理旧镜像（可选）
read -p "是否清理旧的 Docker 镜像？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理旧镜像..."
    docker system prune -f
    docker-compose build --no-cache
else
    echo "🔨 构建应用镜像..."
    docker-compose build
fi

# 启动服务
echo "🚀 启动所有服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 检查应用健康状态
echo "🏥 检查应用健康状态..."
for i in {1..30}; do
    if curl -f http://localhost:8100/api/health &> /dev/null; then
        echo "✅ 应用启动成功！"
        break
    fi
    echo "⏳ 等待应用启动... ($i/30)"
    sleep 2
done

# 初始化管理员（如果需要）
echo "👤 检查管理员账户..."
if docker-compose exec -T app npm run check-admin 2>/dev/null | grep -q "No admin found"; then
    echo "🔧 初始化管理员账户..."
    docker-compose exec -T app npm run init-admin
    echo "✅ 管理员账户初始化完成"
else
    echo "✅ 管理员账户已存在"
fi

# 显示访问信息
echo ""
echo "🎉 部署完成！"
echo "================================================"
echo "📱 应用访问地址: http://localhost:8100"
echo "👤 管理员登录: http://localhost:8100/auth/login"
echo "📊 服务状态: docker-compose ps"
echo "📋 查看日志: docker-compose logs -f app"
echo ""
echo "🔧 如需配置 Dify 集成："
echo "1. 访问 http://localhost:8100/admin/agents"
echo "2. 创建新的 Agent 并配置 Dify API"
echo "3. 设置 difyUrl 和 difyKey 参数"
echo ""
echo "📖 详细文档: 查看 DIFY_DEPLOYMENT_GUIDE.md"
echo "================================================"

# 显示重要提醒
echo ""
echo "⚠️  重要提醒："
echo "1. 首次登录请修改管理员密码"
echo "2. 生产环境请配置 HTTPS"
echo "3. 定期备份数据库数据"
echo "4. 监控系统资源使用情况"
echo ""
