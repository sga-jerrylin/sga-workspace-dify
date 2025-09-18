#!/bin/bash

# 🔍 部署检查脚本 - 验证Docker部署是否成功

echo "🚀 检查 AI 工作空间部署状态..."
echo "========================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_docker() {
    echo -e "${BLUE}🐳 检查 Docker 服务...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装${NC}"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker 服务未运行${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Docker 服务正常${NC}"
    return 0
}

check_containers() {
    echo -e "${BLUE}📦 检查容器状态...${NC}"
    
    # 检查容器是否运行
    containers=("app" "postgres" "redis" "nginx")
    all_running=true
    
    for container in "${containers[@]}"; do
        if docker-compose ps | grep -q "${container}.*Up"; then
            echo -e "${GREEN}✅ ${container} 容器运行中${NC}"
        else
            echo -e "${RED}❌ ${container} 容器未运行${NC}"
            all_running=false
        fi
    done
    
    if [ "$all_running" = true ]; then
        return 0
    else
        return 1
    fi
}

check_ports() {
    echo -e "${BLUE}🌐 检查端口访问...${NC}"
    
    # 检查主要端口
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8100 | grep -q "200\|302\|404"; then
        echo -e "${GREEN}✅ 端口 8100 (主应用) 可访问${NC}"
    else
        echo -e "${RED}❌ 端口 8100 (主应用) 不可访问${NC}"
        return 1
    fi
    
    return 0
}

check_api() {
    echo -e "${BLUE}🔌 检查 API 接口...${NC}"
    
    # 检查初始化状态API
    response=$(curl -s http://localhost:8100/api/system/simple-init-check)
    
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✅ API 接口正常${NC}"
        
        # 检查是否需要初始化
        if echo "$response" | grep -q '"needsInit":true'; then
            echo -e "${YELLOW}⚠️ 系统需要初始化${NC}"
            echo -e "${BLUE}💡 请访问 http://localhost:8100 完成初始化${NC}"
        else
            echo -e "${GREEN}✅ 系统已初始化${NC}"
            echo -e "${BLUE}💡 可以访问 http://localhost:8100 登录系统${NC}"
        fi
    else
        echo -e "${RED}❌ API 接口异常${NC}"
        return 1
    fi
    
    return 0
}

show_logs() {
    echo -e "${BLUE}📋 最近的应用日志:${NC}"
    echo "----------------------------------------"
    docker-compose logs --tail=10 app
    echo "----------------------------------------"
}

show_summary() {
    echo ""
    echo "========================================"
    echo -e "${BLUE}📊 部署状态汇总${NC}"
    echo "========================================"
    
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}🎉 部署成功！${NC}"
        echo ""
        echo -e "${BLUE}🌐 访问地址:${NC}"
        echo "   主应用: http://localhost:8100"
        echo ""
        echo -e "${BLUE}📋 下一步:${NC}"
        echo "   1. 打开浏览器访问 http://localhost:8100"
        echo "   2. 如果是首次部署，填写管理员信息完成初始化"
        echo "   3. 如果已初始化，直接登录系统"
        echo ""
        echo -e "${GREEN}✨ 享受使用 AI 工作空间！${NC}"
    else
        echo -e "${RED}❌ 部署存在问题${NC}"
        echo ""
        echo -e "${YELLOW}🔧 故障排除建议:${NC}"
        echo "   1. 检查 Docker 是否正常运行"
        echo "   2. 运行: docker-compose up -d"
        echo "   3. 查看日志: docker-compose logs app"
        echo "   4. 重启服务: docker-compose restart"
        echo ""
        echo -e "${BLUE}📞 需要帮助？请提供以下信息:${NC}"
        echo "   - 运行环境（操作系统、Docker版本）"
        echo "   - 错误日志（docker-compose logs app）"
        echo "   - 本脚本的输出结果"
    fi
}

# 主检查流程
main() {
    local exit_code=0
    
    # 执行各项检查
    check_docker || exit_code=1
    echo ""
    
    check_containers || exit_code=1
    echo ""
    
    check_ports || exit_code=1
    echo ""
    
    check_api || exit_code=1
    echo ""
    
    # 如果有问题，显示日志
    if [ $exit_code -ne 0 ]; then
        show_logs
        echo ""
    fi
    
    # 显示汇总
    show_summary $exit_code
    
    exit $exit_code
}

# 运行主函数
main
