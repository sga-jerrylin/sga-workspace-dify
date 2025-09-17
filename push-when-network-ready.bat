@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🌐 网络恢复后推送脚本
echo ================================================
echo 当前状态：所有代码已完整提交到本地仓库
echo 目标仓库：https://github.com/sga-jerrylin/sga-workspace-dify.git
echo ================================================

:check_network
echo 🔍 检查网络连接...
ping github.com -n 1 >nul 2>&1
if errorlevel 1 (
    echo ❌ GitHub 连接失败，等待网络恢复...
    echo 按任意键重试，或 Ctrl+C 退出
    pause >nul
    goto check_network
)

echo ✅ 网络连接正常

echo 📋 选择推送方式：
echo 1. 合并远程更改后推送（推荐）
echo 2. 强制推送（覆盖远程内容）
echo 3. 退出
set /p choice="请选择 (1-3): "

if "!choice!"=="1" goto merge_push
if "!choice!"=="2" goto force_push
if "!choice!"=="3" goto exit
echo 无效选择，请重新选择
goto check_network

:merge_push
echo 🔄 拉取远程更改并合并...
git pull dify-repo main --allow-unrelated-histories
if errorlevel 1 (
    echo ❌ 拉取失败，请检查网络或权限
    pause
    goto exit
)

echo 📝 检查是否有冲突需要解决...
git status | findstr "both modified" >nul
if not errorlevel 1 (
    echo ⚠️  发现合并冲突，请手动解决后运行：
    echo    git add .
    echo    git commit -m "解决合并冲突"
    echo    git push dify-repo main
    pause
    goto exit
)

echo 🚀 推送到远程仓库...
git push dify-repo main
if errorlevel 1 (
    echo ❌ 推送失败
    pause
    goto exit
)

echo ✅ 推送成功！
goto create_tag

:force_push
echo ⚠️  警告：强制推送将覆盖远程仓库的所有内容！
set /p confirm="确定要继续吗？(y/N): "
if /i not "!confirm!"=="y" goto check_network

echo 🚀 强制推送到远程仓库...
git push dify-repo main --force
if errorlevel 1 (
    echo ❌ 强制推送失败
    pause
    goto exit
)

echo ✅ 强制推送成功！
goto create_tag

:create_tag
echo 🏷️  创建版本标签...
git tag -a v1.3.0 -m "v1.3.0 - Dify 集成增强版正式发布"
git push dify-repo v1.3.0
if errorlevel 1 (
    echo ⚠️  标签推送失败，但主分支已推送成功
) else (
    echo ✅ 版本标签创建成功！
)

echo.
echo 🎉 推送完成！
echo ================================================
echo 📱 仓库地址: https://github.com/sga-jerrylin/sga-workspace-dify.git
echo 📋 下一步：在其他机器上测试克隆和部署
echo.
echo 测试命令：
echo git clone https://github.com/sga-jerrylin/sga-workspace-dify.git
echo cd sga-workspace-dify
echo build-and-deploy.bat
echo ================================================

:exit
pause
