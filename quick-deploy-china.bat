@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ===========================================
REM 🚀 企业AI工作空间 - 中国网络优化部署脚本
REM ===========================================

echo 🚀 开始部署企业AI工作空间 (中国网络优化版本)...

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未安装，请先安装Docker Desktop
    pause
    exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose未安装，请先安装Docker Compose
    pause
    exit /b 1
)

REM 检查网络连接
echo 🌐 检查网络连接...
ping -n 1 registry.cn-hangzhou.aliyuncs.com >nul 2>&1
if errorlevel 1 (
    echo ⚠️  阿里云镜像仓库连接可能有问题
    echo 🔧 正在配置Docker镜像加速器...
    call fix-docker-network.bat
    echo 请重启Docker Desktop后重新运行此脚本
    pause
    exit /b 1
) else (
    echo ✅ 阿里云镜像仓库连接正常
)

REM 创建必要的目录
echo 📁 创建必要的目录...
if not exist "uploads" mkdir uploads
if not exist "public\uploads" mkdir public\uploads
if not exist "logs" mkdir logs
if not exist "docker\nginx\ssl" mkdir docker\nginx\ssl

REM 复制环境变量文件
if not exist ".env" (
    echo 📝 创建环境变量文件...
    copy ".env.production" ".env" >nul
    echo ✅ 已创建 .env 文件，请根据需要修改配置
) else (
    echo ✅ .env 文件已存在
)

REM 停止现有服务
echo 🛑 停止现有服务...
docker compose -f docker-compose.china.yml down >nul 2>&1

REM 清理旧的镜像和容器
echo 🧹 清理旧资源...
docker system prune -f >nul 2>&1

REM 设置超时时间
set DOCKER_CLIENT_TIMEOUT=600
set COMPOSE_HTTP_TIMEOUT=600

echo 🏗️  构建和启动服务 (使用中国镜像源)...
echo 这可能需要几分钟时间，请耐心等待...

REM 分步骤启动服务
echo 📦 启动数据库服务...
docker compose -f docker-compose.china.yml up -d postgres redis
if errorlevel 1 (
    echo ❌ 数据库服务启动失败
    echo 🔍 可能的原因:
    echo    1. 端口被占用 (5433, 6380)
    echo    2. 网络连接问题
    echo    3. Docker配置问题
    echo.
    echo 📋 解决方案:
    echo    1. 检查端口占用: netstat -ano ^| findstr :5433
    echo    2. 重启Docker Desktop
    echo    3. 运行 fix-docker-network.bat 配置镜像加速器
    goto :error
)

echo ⏳ 等待数据库就绪...
timeout /t 45 /nobreak >nul

echo 🚀 启动应用服务...
docker compose -f docker-compose.china.yml up -d app
if errorlevel 1 (
    echo ❌ 应用服务启动失败
    echo 📋 查看详细日志: docker compose -f docker-compose.china.yml logs app
    goto :error
)

echo ⏳ 等待应用就绪...
timeout /t 45 /nobreak >nul

echo 🌐 启动网关服务...
docker compose -f docker-compose.china.yml up -d nginx
if errorlevel 1 (
    echo ❌ 网关服务启动失败
    echo 📋 查看详细日志: docker compose -f docker-compose.china.yml logs nginx
    goto :error
)

REM 等待服务启动
echo ⏳ 等待所有服务启动完成...
timeout /t 60 /nobreak >nul

REM 检查服务状态
echo 🔍 检查服务状态...
docker compose -f docker-compose.china.yml ps

REM 检查健康状态
echo 🏥 检查服务健康状态...
for /l %%i in (1,1,15) do (
    curl -s http://localhost:8100/health >nul 2>&1
    if not errorlevel 1 (
        echo ✅ 应用服务健康检查通过
        goto :success
    ) else (
        echo ⏳ 等待应用服务启动... (%%i/15)
        timeout /t 10 /nobreak >nul
    )
)

echo ⚠️  健康检查超时，但服务可能仍在启动中
echo 📋 请稍后手动检查: http://localhost:8100

:success
echo.
echo 🎉 部署完成！(中国网络优化版本)
echo.
echo 📱 访问地址:
echo    主应用: http://localhost:8100
echo    数据库: localhost:5433 (用户: ai_user, 密码: ai_password_2024)
echo    Redis: localhost:6380 (密码: redis_password_2024)
echo.
echo 👤 默认管理员账号:
echo    邮箱: admin@example.com
echo    密码: Admin123456
echo.
echo 📋 常用命令 (中国版本):
echo    查看日志: docker compose -f docker-compose.china.yml logs -f
echo    重启服务: docker compose -f docker-compose.china.yml restart
echo    停止服务: docker compose -f docker-compose.china.yml down
echo    更新服务: docker compose -f docker-compose.china.yml pull ^&^& docker compose -f docker-compose.china.yml up -d
echo.
echo ⚠️  重要提醒:
echo    1. 本版本使用阿里云镜像源，适合中国大陆网络环境
echo    2. 请修改 .env 文件中的默认密码
echo    3. 请设置正确的 DEFAULT_DIFY_BASE_URL
echo    4. 生产环境请使用 HTTPS
echo.
pause
exit /b 0

:error
echo.
echo ❌ 部署失败！
echo.
echo 🔍 故障排除:
echo    1. 运行 fix-docker-network.bat 配置Docker镜像加速器
echo    2. 重启Docker Desktop
echo    3. 检查端口占用: netstat -ano ^| findstr :8100
echo    4. 查看详细日志: docker compose -f docker-compose.china.yml logs
echo    5. 检查防火墙设置
echo.
echo 📞 如果问题持续，请提供以下信息:
echo    - Windows版本
echo    - Docker Desktop版本
echo    - 网络环境 (是否使用代理/VPN)
echo    - 错误日志
echo.
pause
exit /b 1
