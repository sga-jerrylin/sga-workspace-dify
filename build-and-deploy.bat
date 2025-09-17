@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 SGA Workspace Dify 版本 - 自动部署脚本
echo ================================================

REM 检查 Docker 环境
echo 📋 检查系统环境...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过

REM 检查环境变量文件
if not exist ".env" (
    echo 📝 创建环境变量文件...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ 已从 .env.example 创建 .env 文件
        echo ⚠️  请编辑 .env 文件配置必要参数
    ) else (
        echo ❌ 未找到 .env.example 文件
        pause
        exit /b 1
    )
)

REM 停止现有服务
echo 🛑 停止现有服务...
docker-compose down 2>nul

REM 询问是否清理旧镜像
set /p cleanup="是否清理旧的 Docker 镜像？(y/N): "
if /i "!cleanup!"=="y" (
    echo 🧹 清理旧镜像...
    docker system prune -f
    docker-compose build --no-cache
) else (
    echo 🔨 构建应用镜像...
    docker-compose build
)

REM 启动服务
echo 🚀 启动所有服务...
docker-compose up -d

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
echo 📊 检查服务状态...
docker-compose ps

REM 检查应用健康状态
echo 🏥 检查应用健康状态...
set /a count=0
:healthcheck
set /a count+=1
curl -f http://localhost:8100/api/health >nul 2>&1
if errorlevel 1 (
    if !count! lss 30 (
        echo ⏳ 等待应用启动... (!count!/30)
        timeout /t 2 /nobreak >nul
        goto healthcheck
    ) else (
        echo ❌ 应用启动超时，请检查日志
        docker-compose logs app
        pause
        exit /b 1
    )
)

echo ✅ 应用启动成功！

REM 初始化管理员
echo 👤 检查管理员账户...
docker-compose exec -T app npm run check-admin 2>nul | findstr "No admin found" >nul
if not errorlevel 1 (
    echo 🔧 初始化管理员账户...
    docker-compose exec -T app npm run init-admin
    echo ✅ 管理员账户初始化完成
) else (
    echo ✅ 管理员账户已存在
)

REM 显示访问信息
echo.
echo 🎉 部署完成！
echo ================================================
echo 📱 应用访问地址: http://localhost:8100
echo 👤 管理员登录: http://localhost:8100/auth/login
echo 📊 服务状态: docker-compose ps
echo 📋 查看日志: docker-compose logs -f app
echo.
echo 🔧 如需配置 Dify 集成：
echo 1. 访问 http://localhost:8100/admin/agents
echo 2. 创建新的 Agent 并配置 Dify API
echo 3. 设置 difyUrl 和 difyKey 参数
echo.
echo 📖 详细文档: 查看 DIFY_DEPLOYMENT_GUIDE.md
echo ================================================

REM 显示重要提醒
echo.
echo ⚠️  重要提醒：
echo 1. 首次登录请修改管理员密码
echo 2. 生产环境请配置 HTTPS
echo 3. 定期备份数据库数据
echo 4. 监控系统资源使用情况
echo.

REM 询问是否打开浏览器
set /p openbrowser="是否打开浏览器访问应用？(Y/n): "
if /i not "!openbrowser!"=="n" (
    start http://localhost:8100
)

pause
