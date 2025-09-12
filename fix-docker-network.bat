@echo off
chcp 65001 >nul
echo 🔧 修复Docker网络连接问题...

echo.
echo 📋 检测到Docker Hub连接问题，正在应用解决方案...
echo.

REM 创建Docker配置目录
if not exist "%USERPROFILE%\.docker" mkdir "%USERPROFILE%\.docker"

REM 创建daemon.json配置文件
echo 📝 配置Docker镜像加速器...
(
echo {
echo   "registry-mirrors": [
echo     "https://docker.mirrors.ustc.edu.cn",
echo     "https://hub-mirror.c.163.com",
echo     "https://mirror.baidubce.com",
echo     "https://dockerproxy.com"
echo   ],
echo   "dns": ["8.8.8.8", "8.8.4.4"],
echo   "max-concurrent-downloads": 10,
echo   "max-concurrent-uploads": 5
echo }
) > "%USERPROFILE%\.docker\daemon.json"

echo ✅ Docker配置已更新

echo.
echo 🔄 请重启Docker Desktop以应用配置...
echo.
echo 📋 重启步骤:
echo    1. 右键点击系统托盘中的Docker图标
echo    2. 选择 "Restart Docker Desktop"
echo    3. 等待Docker重启完成
echo.
echo 🚀 重启完成后，请重新运行部署命令:
echo    docker compose up -d
echo.

pause
