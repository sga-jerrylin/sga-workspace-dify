#!/bin/bash

echo "========================================"
echo "强制初始化管理员用户"
echo "========================================"
echo ""
echo "此脚本将会："
echo "1. 删除现有的管理员用户"
echo "2. 创建新的管理员用户"
echo "   - 用户名: admin"
echo "   - 密码: 123456"
echo ""
echo "按 Enter 继续，或按 Ctrl+C 取消..."
read -r

echo ""
echo "正在运行初始化脚本..."
npx tsx scripts/force-init-admin.ts

echo ""
echo "脚本执行完成！"
