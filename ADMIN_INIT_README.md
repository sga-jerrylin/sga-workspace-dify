# 管理员用户初始化脚本

本项目提供了多种方式来初始化管理员用户，默认创建用户名为 `admin`，密码为 `123456` 的管理员账户。

## 🚀 一键启动（推荐）

如果你是第一次使用，推荐使用一键启动脚本：

```bash
# Windows
quick-start-with-admin.bat

# Linux/Mac
chmod +x quick-start-with-admin.sh && ./quick-start-with-admin.sh
```

这个脚本会自动：
1. 启动 Docker 服务
2. 构建并启动应用
3. 初始化管理员用户
4. 打开浏览器访问应用

## 🐳 Docker 环境使用

### 方法1: Docker 脚本（推荐）

```bash
# Windows
docker-init-admin.bat

# Linux/Mac
chmod +x docker-init-admin.sh && ./docker-init-admin.sh
```

### 方法2: 直接 Docker 命令

```bash
# 在现有容器中运行
docker-compose exec app node init-admin.js

# 或者强制重新创建
docker-compose exec app npx tsx scripts/force-init-admin.ts

# 使用临时容器运行
docker-compose run --rm app node init-admin.js
```

## 📦 本地开发环境使用

如果你有本地 Node.js 环境：

### 方法1: 使用 npm 脚本（推荐）

```bash
# 初始化管理员（如果已存在会提示）
npm run init-admin

# 强制重新创建管理员（会删除现有管理员）
npm run force-init-admin

# 使用原有的创建脚本
npm run create-admin
```

### 方法2: 直接运行脚本

```bash
# 简单初始化（JavaScript版本）
node init-admin.js

# 强制初始化（TypeScript版本）
npx tsx scripts/force-init-admin.ts

# 原有创建脚本
npx tsx scripts/create-admin-user.ts
```

### 方法3: 使用批处理文件（Windows）

```bash
# 强制初始化
force-init-admin.bat
```

### 方法4: 使用Shell脚本（Linux/Mac）

```bash
# 给脚本执行权限
chmod +x force-init-admin.sh

# 运行脚本
./force-init-admin.sh
```

## 脚本说明

### init-admin.js
- **用途**: 安全的管理员初始化
- **特点**: 如果管理员已存在，会提示而不会覆盖
- **适用**: 首次初始化或确认没有现有管理员时使用

### scripts/force-init-admin.ts
- **用途**: 强制重新创建管理员
- **特点**: 会删除所有现有管理员用户及其相关数据，然后创建新的管理员
- **适用**: 需要重置管理员账户时使用
- **⚠️ 警告**: 会删除现有管理员的所有数据（聊天记录、文件等）

### scripts/create-admin-user.ts
- **用途**: 原有的管理员创建脚本
- **特点**: 检查是否已存在管理员，如果存在则跳过创建
- **适用**: 标准的管理员创建流程

## 默认管理员信息

创建成功后，管理员账户信息如下：

- **用户名**: `admin`
- **密码**: `123456`
- **用户ID**: `admin`
- **中文姓名**: `系统管理员`
- **英文姓名**: `System Admin`
- **邮箱**: `admin@sologenai.com`
- **手机**: `13800138000`
- **角色**: `ADMIN`

## 注意事项

1. **数据库连接**: 确保 `DATABASE_URL` 环境变量已正确配置
2. **依赖安装**: 确保已安装所有依赖 (`npm install`)
3. **Prisma 同步**: 确保数据库 schema 已同步 (`npx prisma db push` 或 `npx prisma migrate deploy`)
4. **安全性**: 生产环境中请及时修改默认密码

## 故障排除

### 常见错误

1. **P2002 错误**: 用户名或用户ID已存在
   - 解决方案: 使用 `force-init-admin` 脚本强制重新创建

2. **数据库连接错误**: 
   - 检查 `DATABASE_URL` 环境变量
   - 确保数据库服务正在运行

3. **Prisma 客户端错误**:
   - 运行 `npx prisma generate` 重新生成客户端

### 手动清理（如需要）

如果需要手动清理管理员数据：

```sql
-- 删除管理员用户的相关数据
DELETE FROM user_agent_permissions WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');
DELETE FROM chat_messages WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');
DELETE FROM chat_sessions WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');
DELETE FROM uploaded_files WHERE user_id IN (SELECT id FROM users WHERE role = 'ADMIN');
DELETE FROM users WHERE role = 'ADMIN';
```

## 更新日志

- 2024-01-XX: 添加了多种初始化方式
- 2024-01-XX: 增加了强制重新创建功能
- 2024-01-XX: 添加了批处理和Shell脚本支持
