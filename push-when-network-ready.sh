#!/bin/bash

# 网络恢复后推送脚本
set -e

echo "🌐 网络恢复后推送脚本"
echo "================================================"
echo "当前状态：所有代码已完整提交到本地仓库"
echo "目标仓库：https://github.com/sga-jerrylin/sga-workspace-dify.git"
echo "================================================"

check_network() {
    echo "🔍 检查网络连接..."
    if ! ping -c 1 github.com &> /dev/null; then
        echo "❌ GitHub 连接失败，等待网络恢复..."
        read -p "按 Enter 重试，或 Ctrl+C 退出"
        check_network
    fi
    echo "✅ 网络连接正常"
}

merge_push() {
    echo "🔄 拉取远程更改并合并..."
    if ! git pull dify-repo main --allow-unrelated-histories; then
        echo "❌ 拉取失败，请检查网络或权限"
        exit 1
    fi

    echo "📝 检查是否有冲突需要解决..."
    if git status | grep -q "both modified"; then
        echo "⚠️  发现合并冲突，请手动解决后运行："
        echo "   git add ."
        echo "   git commit -m '解决合并冲突'"
        echo "   git push dify-repo main"
        exit 1
    fi

    echo "🚀 推送到远程仓库..."
    if ! git push dify-repo main; then
        echo "❌ 推送失败"
        exit 1
    fi

    echo "✅ 推送成功！"
    create_tag
}

force_push() {
    echo "⚠️  警告：强制推送将覆盖远程仓库的所有内容！"
    read -p "确定要继续吗？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        main_menu
        return
    fi

    echo "🚀 强制推送到远程仓库..."
    if ! git push dify-repo main --force; then
        echo "❌ 强制推送失败"
        exit 1
    fi

    echo "✅ 强制推送成功！"
    create_tag
}

create_tag() {
    echo "🏷️  创建版本标签..."
    git tag -a v1.3.0 -m "v1.3.0 - Dify 集成增强版正式发布"
    if ! git push dify-repo v1.3.0; then
        echo "⚠️  标签推送失败，但主分支已推送成功"
    else
        echo "✅ 版本标签创建成功！"
    fi

    echo ""
    echo "🎉 推送完成！"
    echo "================================================"
    echo "📱 仓库地址: https://github.com/sga-jerrylin/sga-workspace-dify.git"
    echo "📋 下一步：在其他机器上测试克隆和部署"
    echo ""
    echo "测试命令："
    echo "git clone https://github.com/sga-jerrylin/sga-workspace-dify.git"
    echo "cd sga-workspace-dify"
    echo "./build-and-deploy.sh"
    echo "================================================"
}

main_menu() {
    echo "📋 选择推送方式："
    echo "1. 合并远程更改后推送（推荐）"
    echo "2. 强制推送（覆盖远程内容）"
    echo "3. 退出"
    read -p "请选择 (1-3): " choice

    case $choice in
        1)
            merge_push
            ;;
        2)
            force_push
            ;;
        3)
            echo "退出"
            exit 0
            ;;
        *)
            echo "无效选择，请重新选择"
            main_menu
            ;;
    esac
}

# 主程序
check_network
main_menu
