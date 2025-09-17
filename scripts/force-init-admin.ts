/**
 * 强制初始化管理员用户脚本
 * 会删除现有管理员用户并重新创建
 * 用户名: admin
 * 密码: 123456
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function forceInitAdmin() {
  try {
    console.log('🚀 开始强制初始化管理员用户...')

    // 1. 确保有默认公司
    let company = await prisma.company.findFirst({
      where: { name: 'Solo Genius Agent' }
    })
    
    if (!company) {
      console.log('📝 创建默认公司...')
      company = await prisma.company.create({
        data: {
          name: 'Solo Genius Agent',
          logoUrl: '/placeholder-logo.svg',
        }
      })
      console.log('✅ 公司创建成功:', company.name, '(ID:', company.id, ')')
    } else {
      console.log('✅ 找到现有公司:', company.name, '(ID:', company.id, ')')
    }

    // 2. 删除现有的管理员用户
    const existingAdmins = await prisma.user.findMany({
      where: {
        companyId: company.id,
        OR: [
          { role: 'ADMIN' },
          { username: 'admin' },
          { userId: 'admin' }
        ]
      }
    })

    if (existingAdmins.length > 0) {
      console.log(`🗑️ 删除 ${existingAdmins.length} 个现有管理员用户...`)
      for (const admin of existingAdmins) {
        console.log(`   - 删除用户: ${admin.username} (${admin.chineseName})`)
        
        // 删除用户相关的所有数据
        await prisma.userAgentPermission.deleteMany({
          where: { userId: admin.id }
        })
        
        await prisma.chatMessage.deleteMany({
          where: { userId: admin.id }
        })
        
        await prisma.chatSession.deleteMany({
          where: { userId: admin.id }
        })
        
        await prisma.uploadedFile.deleteMany({
          where: { userId: admin.id }
        })
        
        await prisma.user.delete({
          where: { id: admin.id }
        })
      }
      console.log('✅ 现有管理员用户已删除')
    }

    // 3. 创建新的管理员用户
    console.log('👤 创建新的管理员用户...')
    const passwordHash = await bcrypt.hash('123456', 12)
    
    const adminUser = await prisma.user.create({
      data: {
        companyId: company.id,
        username: 'admin',
        userId: 'admin',
        phone: '13800138000',
        passwordHash,
        chineseName: '系统管理员',
        englishName: 'System Admin',
        email: 'admin@sologenai.com',
        role: 'ADMIN',
        displayName: '系统管理员',
        isActive: true,
      }
    })

    console.log('\n🎉 管理员用户创建成功！')
    console.log('==================================================')
    console.log('登录信息:')
    console.log(`用户名: ${adminUser.username}`)
    console.log(`用户ID: ${adminUser.userId}`)
    console.log(`密码: 123456`)
    console.log(`角色: ${adminUser.role}`)
    console.log(`中文姓名: ${adminUser.chineseName}`)
    console.log(`邮箱: ${adminUser.email}`)
    console.log(`手机: ${adminUser.phone}`)
    console.log('==================================================')
    console.log('\n✅ 现在可以使用 admin/123456 登录系统了！')

  } catch (error) {
    console.error('❌ 强制初始化管理员失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 运行脚本
if (require.main === module) {
  forceInitAdmin()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default forceInitAdmin
