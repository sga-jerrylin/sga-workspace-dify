#!/usr/bin/env node

/**
 * 🚀 一键初始化脚本 - 简单、可靠、快速
 * 
 * 使用方法：
 * 1. 直接运行：node quick-init.js
 * 2. 或者：npm run quick-init
 * 
 * 功能：
 * - 检查数据库连接
 * - 创建默认公司
 * - 创建管理员用户
 * - 创建初始化完成标记文件
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// 初始化完成标记文件
const INIT_FLAG_FILE = path.join(__dirname, '.initialized')

// 默认管理员配置
const DEFAULT_ADMIN = {
  username: 'admin',
  userId: 'admin',
  password: '123456',
  phone: '13800138000',
  chineseName: '系统管理员',
  englishName: 'System Admin',
  email: 'admin@sologenai.com'
}

// 默认公司配置
const DEFAULT_COMPANY = {
  name: 'Solo Genius Agent',
  logoUrl: '/placeholder-logo.svg'
}

async function checkDatabase() {
  console.log('🔍 检查数据库连接...')
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ 数据库连接正常')
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    console.log('\n💡 请检查：')
    console.log('   - PostgreSQL 服务是否运行')
    console.log('   - DATABASE_URL 环境变量是否正确')
    console.log('   - 数据库是否已创建')
    console.log('   - 网络连接是否正常')
    return false
  }
}

async function checkIfInitialized() {
  // 检查文件标记
  if (fs.existsSync(INIT_FLAG_FILE)) {
    console.log('⚠️ 系统已经初始化过了')
    console.log('如需重新初始化，请删除文件:', INIT_FLAG_FILE)
    return true
  }

  // 检查数据库中是否有用户
  try {
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      console.log('⚠️ 数据库中已有用户，系统可能已初始化')
      console.log('如需强制重新初始化，请使用 --force 参数')
      return true
    }
  } catch (error) {
    console.log('⚠️ 无法检查用户数量，继续初始化...')
  }

  return false
}

async function createCompany() {
  console.log('🏢 创建默认公司...')
  
  try {
    // 检查是否已有公司
    let company = await prisma.company.findFirst({
      where: { name: DEFAULT_COMPANY.name }
    })
    
    if (company) {
      console.log('✅ 找到现有公司:', company.name)
      return company
    }

    // 创建新公司
    company = await prisma.company.create({
      data: DEFAULT_COMPANY
    })
    
    console.log('✅ 公司创建成功:', company.name)
    return company
  } catch (error) {
    console.error('❌ 创建公司失败:', error.message)
    throw error
  }
}

async function createAdmin(company) {
  console.log('👤 创建管理员用户...')
  
  try {
    // 检查是否已有管理员
    const existingAdmin = await prisma.user.findFirst({
      where: {
        companyId: company.id,
        username: DEFAULT_ADMIN.username
      }
    })

    if (existingAdmin) {
      console.log('✅ 找到现有管理员:', existingAdmin.username)
      return existingAdmin
    }

    // 创建密码哈希
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10)
    
    // 创建管理员用户
    const adminUser = await prisma.user.create({
      data: {
        companyId: company.id,
        username: DEFAULT_ADMIN.username,
        userId: DEFAULT_ADMIN.userId,
        phone: DEFAULT_ADMIN.phone,
        passwordHash,
        chineseName: DEFAULT_ADMIN.chineseName,
        englishName: DEFAULT_ADMIN.englishName,
        email: DEFAULT_ADMIN.email,
        role: 'ADMIN',
        isActive: true,
      }
    })

    console.log('✅ 管理员用户创建成功')
    return adminUser
  } catch (error) {
    console.error('❌ 创建管理员失败:', error.message)
    throw error
  }
}

function createInitFlag() {
  console.log('📝 创建初始化完成标记...')
  
  try {
    const initInfo = {
      initialized: true,
      timestamp: new Date().toISOString(),
      admin: {
        username: DEFAULT_ADMIN.username,
        password: DEFAULT_ADMIN.password
      },
      company: DEFAULT_COMPANY.name
    }
    
    fs.writeFileSync(INIT_FLAG_FILE, JSON.stringify(initInfo, null, 2))
    console.log('✅ 初始化标记创建成功')
  } catch (error) {
    console.error('❌ 创建初始化标记失败:', error.message)
    // 不抛出错误，因为这不是关键步骤
  }
}

function printSuccess(adminUser) {
  console.log('\n🎉 系统初始化完成！')
  console.log('=' .repeat(50))
  console.log('📋 登录信息:')
  console.log(`   用户名: ${adminUser.username}`)
  console.log(`   用户ID: ${adminUser.userId}`)
  console.log(`   密码: ${DEFAULT_ADMIN.password}`)
  console.log(`   角色: ${adminUser.role}`)
  console.log(`   姓名: ${adminUser.chineseName}`)
  console.log(`   邮箱: ${adminUser.email}`)
  console.log(`   手机: ${adminUser.phone}`)
  console.log('=' .repeat(50))
  console.log('🌐 现在可以访问系统了:')
  console.log('   http://localhost:8100 (如果使用Docker)')
  console.log('   http://localhost:3000 (如果直接运行)')
  console.log('\n✅ 使用上面的用户名和密码登录系统！')
}

async function quickInit() {
  const isForce = process.argv.includes('--force')
  
  console.log('🚀 开始一键初始化系统...')
  console.log('时间:', new Date().toLocaleString())
  console.log('')

  try {
    // 1. 检查数据库连接
    const dbOk = await checkDatabase()
    if (!dbOk) {
      process.exit(1)
    }

    // 2. 检查是否已初始化
    if (!isForce) {
      const isInitialized = await checkIfInitialized()
      if (isInitialized) {
        console.log('\n💡 如需重新初始化，请使用: node quick-init.js --force')
        process.exit(0)
      }
    }

    // 3. 创建公司
    const company = await createCompany()

    // 4. 创建管理员
    const adminUser = await createAdmin(company)

    // 5. 创建初始化标记
    createInitFlag()

    // 6. 显示成功信息
    printSuccess(adminUser)

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message)
    console.log('\n🔧 故障排除建议:')
    console.log('   1. 检查数据库是否正常运行')
    console.log('   2. 检查环境变量配置')
    console.log('   3. 检查网络连接')
    console.log('   4. 查看详细错误日志')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行脚本
if (require.main === module) {
  quickInit()
}

module.exports = { quickInit }
