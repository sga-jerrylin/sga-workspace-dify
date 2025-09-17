import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseConnection() {
  try {
    console.log('🔍 检查数据库连接...')
    
    // 尝试连接数据库
    await prisma.$connect()
    console.log('✅ 数据库连接成功')
    
    // 检查表是否存在
    const userCount = await prisma.user.count()
    console.log(`👥 用户数量: ${userCount}`)
    
    const agentCount = await prisma.agent.count()
    console.log(`🤖 Agent 数量: ${agentCount}`)
    
    const sessionCount = await prisma.session.count()
    console.log(`💬 会话数量: ${sessionCount}`)
    
    console.log('✅ 数据库状态正常')
    process.exit(0)
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    console.error('请检查:')
    console.error('1. 数据库服务是否启动')
    console.error('2. DATABASE_URL 环境变量是否正确')
    console.error('3. 数据库迁移是否完成')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseConnection()
