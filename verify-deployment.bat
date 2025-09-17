@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🔍 SGA Workspace Dify 版本 - 部署验证
echo ================================================

REM 检查服务状态
echo 📊 检查 Docker 服务状态...
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ 服务未正常运行，请先启动服务
    echo 运行: docker-compose up -d
    pause
    exit /b 1
)
echo ✅ Docker 服务运行正常

REM 检查应用健康状态
echo 🏥 检查应用健康状态...
curl -f http://localhost:8100/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ 应用健康检查失败
    echo 请检查应用日志: docker-compose logs app
    pause
    exit /b 1
)
echo ✅ 应用健康状态正常

REM 检查数据库连接
echo 🗄️ 检查数据库连接...
docker-compose exec -T app npm run db:status >nul 2>&1
if errorlevel 1 (
    echo ❌ 数据库连接失败
    echo 请检查数据库服务: docker-compose logs postgres
    pause
    exit /b 1
)
echo ✅ 数据库连接正常

REM 检查管理员账户
echo 👤 检查管理员账户...
docker-compose exec -T app npm run check-admin 2>nul | findstr "管理员账户已存在" >nul
if errorlevel 1 (
    echo ⚠️  管理员账户不存在，正在创建...
    docker-compose exec -T app npm run init-admin
    echo ✅ 管理员账户创建完成
) else (
    echo ✅ 管理员账户存在
)

REM 检查关键文件
echo 📁 检查关键文件...
set "critical_files=app\components\enhanced-chat-with-sidebar.tsx app\api\dify-chat\route.ts app\api\proxy-image\route.ts lib\enhanced-dify-client.ts docker-compose.yml .env"

for %%f in (%critical_files%) do (
    if not exist "%%f" (
        echo ❌ 关键文件缺失: %%f
        pause
        exit /b 1
    )
)
echo ✅ 所有关键文件存在

REM 检查端口占用
echo 🔌 检查端口占用...
netstat -an | findstr ":8100 " >nul && echo ✅ 端口 8100 正常监听 || echo ⚠️  端口 8100 未被占用
netstat -an | findstr ":5433 " >nul && echo ✅ 端口 5433 正常监听 || echo ⚠️  端口 5433 未被占用
netstat -an | findstr ":6380 " >nul && echo ✅ 端口 6380 正常监听 || echo ⚠️  端口 6380 未被占用

REM 测试图片代理 API
echo 🖼️ 测试图片代理 API...
curl -f "http://localhost:8100/api/proxy-image?url=https://via.placeholder.com/150" -o nul -s >nul 2>&1
if errorlevel 1 (
    echo ⚠️  图片代理 API 可能有问题
) else (
    echo ✅ 图片代理 API 正常
)

REM 显示验证结果
echo.
echo 🎉 部署验证完成！
echo ================================================
echo 📱 应用访问地址: http://localhost:8100
echo 👤 管理员登录: http://localhost:8100/auth/login
echo 🔧 管理员面板: http://localhost:8100/admin
echo 🤖 Agent 管理: http://localhost:8100/admin/agents
echo.
echo 📋 下一步操作：
echo 1. 访问管理员面板配置 Dify Agent
echo 2. 设置 difyUrl 和 difyKey 参数
echo 3. 测试对话和图片生成功能
echo 4. 检查历史消息图片显示
echo.
echo 🔍 如遇问题，请查看：
echo - 应用日志: docker-compose logs -f app
echo - 服务状态: docker-compose ps
echo - 部署指南: DIFY_DEPLOYMENT_GUIDE.md
echo ================================================

REM 询问是否打开浏览器
set /p openbrowser="是否打开浏览器访问应用？(Y/n): "
if /i not "!openbrowser!"=="n" (
    start http://localhost:8100
)

pause
