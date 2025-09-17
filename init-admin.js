/**
 * 简单的管理员初始化脚本 (JavaScript版本)
 * 直接运行: node init-admin.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initAdmin() {
  try {
    console.log('🚀 开始初始化管理员用户...')

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
      console.log('✅ 公司创建成功:', company.name)
    } else {
      console.log('✅ 找到现有公司:', company.name)
    }

    // 2. 检查是否已有管理员
    const existingAdmin = await prisma.user.findFirst({
      where: {
        companyId: company.id,
        username: 'admin'
      }
    })

    if (existingAdmin) {
      console.log('⚠️ 管理员用户已存在!')
      console.log('如需重新创建，请先删除现有管理员用户')
      console.log('或者使用 force-init-admin 脚本强制重新创建')
      return
    }

    // 3. 创建管理员用户
    console.log('👤 创建管理员用户...')
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
    console.log(`密码: 123456`)
    console.log(`角色: ${adminUser.role}`)
    console.log(`中文姓名: ${adminUser.chineseName}`)
    console.log('==================================================')
    console.log('\n✅ 现在可以使用 admin/123456 登录系统了！')

  } catch (error) {
    console.error('❌ 初始化管理员失败:', error)
    
    if (error.code === 'P2002') {
      console.log('\n💡 提示: 用户名或用户ID已存在')
      console.log('请使用 force-init-admin 脚本强制重新创建')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// 运行脚本
initAdmin()
