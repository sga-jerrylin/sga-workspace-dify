#!/bin/bash

echo "========================================"
echo "Docker 环境管理员初始化脚本"
echo "========================================"
echo ""
echo "此脚本将在 Docker 容器中初始化管理员用户"
echo "- 用户名: admin"
echo "- 密码: 123456"
echo ""
echo "请确保 Docker 服务已启动..."
echo ""

# 检查 Docker 是否运行
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker 服务未运行，请先启动 Docker"
    exit 1
fi

echo "✅ Docker 服务正常运行"
echo ""

# 检查是否有运行中的应用容器
echo "检查应用容器状态..."
docker-compose ps app

echo ""
echo "选择初始化方式:"
echo "1. 在现有容器中运行 (推荐)"
echo "2. 启动临时容器运行"
echo "3. 取消"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo ""
        echo "在现有应用容器中运行初始化脚本..."
        if ! docker-compose exec app node init-admin.js; then
            echo ""
            echo "❌ 在现有容器中运行失败，尝试强制初始化..."
            docker-compose exec app npx tsx scripts/force-init-admin.ts
        fi
        ;;
    2)
        echo ""
        echo "启动临时容器运行初始化脚本..."
        if ! docker-compose run --rm app node init-admin.js; then
            echo ""
            echo "❌ 临时容器运行失败，尝试强制初始化..."
            docker-compose run --rm app npx tsx scripts/force-init-admin.ts
        fi
        ;;
    3)
        echo ""
        echo "已取消初始化"
        exit 0
        ;;
    *)
        echo ""
        echo "❌ 无效选择，请重新运行脚本"
        exit 1
        ;;
esac

echo ""
echo "脚本执行完成！"
echo ""
echo "如果初始化成功，你可以使用以下信息登录:"
echo "- 访问地址: http://localhost:8100"
echo "- 用户名: admin"
echo "- 密码: 123456"
echo ""
