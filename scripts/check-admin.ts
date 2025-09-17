import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    console.log('🔍 检查管理员账户...')
    
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (adminUser) {
      console.log('✅ 管理员账户已存在')
      console.log(`📧 邮箱: ${adminUser.email}`)
      console.log(`👤 姓名: ${adminUser.name}`)
      console.log(`🆔 ID: ${adminUser.id}`)
      process.exit(0)
    } else {
      console.log('❌ No admin found')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 检查管理员账户失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
