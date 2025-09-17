# SGA Workspace Dify 集成版本 - 完整部署指南

## 🎯 版本说明

本版本是 SGA Workspace 的 Dify 集成增强版，完整修复了图片显示问题，包括：

### ✅ 已修复的问题
- **历史对话图片显示问题**：完美支持带签名的 Dify 图片 URL
- **实时生成图片双重显示**：消除重复渲染，只保留图片和文件卡
- **图片 URL 签名参数处理**：正确保留 timestamp、nonce、sign 参数
- **代理 API 认证问题**：完善 API Key 传递和错误处理

### 🚀 核心功能
- **完整的 Dify API 集成**：支持对话、文件上传、图片生成
- **智能图片处理**：自动检测和代理访问 Dify 图片资源
- **统一消息渲染**：历史消息和实时消息使用相同处理逻辑
- **优化的用户体验**：无重复元素，清晰的图片显示

## 📦 快速部署

### 1. 克隆仓库
```bash
git clone https://github.com/sga-jerrylin/sga-workspace-dify.git
cd sga-workspace-dify
```

### 2. 环境配置
复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要参数：
```env
# 数据库配置
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sga_workspace"
POSTGRES_PASSWORD=your_password

# Redis 配置  
REDIS_URL="redis://localhost:6379"

# JWT 密钥
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# 应用配置
NEXT_PUBLIC_APP_URL="http://localhost:8100"
NODE_ENV=production

# 管理员配置（首次部署时使用）
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
ADMIN_NAME="系统管理员"
```

### 3. 一键部署
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

### 4. 初始化管理员（首次部署）
```bash
# 方法1：使用脚本
./docker-init-admin.sh

# 方法2：手动执行
docker-compose exec app npm run init-admin

# 方法3：强制重新初始化
./force-init-admin.sh
```

## 🔧 Dify 集成配置

### 1. 创建 Agent
访问 `http://localhost:8100/admin/agents`，创建新的 Agent：

```json
{
  "name": "Dify AI Assistant",
  "difyUrl": "http://your-dify-server:5001/v1",
  "difyKey": "app-your-dify-api-key",
  "description": "基于 Dify 的 AI 助手"
}
```

### 2. 关键配置说明
- **difyUrl**: Dify API 端点，必须以 `/v1` 结尾
- **difyKey**: Dify 应用的 API Key，格式为 `app-xxxxxxxxx`
- **图片代理**: 系统自动处理 Dify 图片的代理访问和认证

### 3. 支持的功能
- ✅ **文本对话**：完整的对话功能
- ✅ **文件上传**：支持图片、文档等多种格式
- ✅ **图片生成**：AI 生成的图片自动显示
- ✅ **历史记录**：完整的对话历史和图片显示
- ✅ **流式输出**：实时显示 AI 回复过程

## 🛠️ 故障排除

### 图片显示问题
如果图片无法显示，检查：
1. **Dify 服务器连通性**：确保能访问 Dify API
2. **API Key 正确性**：验证 difyKey 格式和权限
3. **代理服务状态**：查看 `/api/proxy-image` 日志
4. **网络配置**：确保容器间网络通信正常

### 常用调试命令
```bash
# 查看应用日志
docker-compose logs -f app

# 查看数据库连接
docker-compose exec app npm run db:status

# 重启服务
docker-compose restart app

# 清理并重新构建
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📋 系统要求

### 最低配置
- **CPU**: 2 核心
- **内存**: 4GB RAM
- **存储**: 20GB 可用空间
- **Docker**: 20.10+ 
- **Docker Compose**: 2.0+

### 推荐配置
- **CPU**: 4 核心
- **内存**: 8GB RAM
- **存储**: 50GB SSD
- **网络**: 稳定的互联网连接

## 🔐 安全配置

### 生产环境建议
1. **修改默认密码**：首次登录后立即修改管理员密码
2. **配置 HTTPS**：使用 SSL 证书保护数据传输
3. **网络隔离**：限制数据库和 Redis 的外部访问
4. **定期备份**：设置数据库自动备份策略

### 环境变量安全
```env
# 使用强密码
JWT_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
POSTGRES_PASSWORD="$(openssl rand -base64 16)"

# 限制访问
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 📞 技术支持

如遇到问题，请提供以下信息：
1. **系统环境**：操作系统、Docker 版本
2. **错误日志**：完整的错误信息和堆栈跟踪
3. **配置信息**：相关的环境变量（隐藏敏感信息）
4. **复现步骤**：详细的操作步骤

## 🎉 更新日志

### v1.3.0 - Dify 集成增强版
- ✅ 完整修复图片显示问题
- ✅ 优化消息渲染逻辑
- ✅ 改进代理 API 性能
- ✅ 增强错误处理机制
- ✅ 完善部署文档

---

**部署成功后，访问 `http://localhost:8100` 开始使用！** 🚀
