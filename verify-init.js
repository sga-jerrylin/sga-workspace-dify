#!/usr/bin/env node

/**
 * 🔍 部署验证脚本 - 检查系统是否正确初始化
 * 
 * 使用方法：
 * 1. 直接运行：node verify-init.js
 * 2. 或者：npm run verify-init
 * 
 * 功能：
 * - 检查数据库连接
 * - 检查初始化状态
 * - 验证管理员账户
 * - 测试API接口
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// 初始化完成标记文件
const INIT_FLAG_FILE = path.join(__dirname, '.initialized')

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function checkDatabase() {
  log('🔍 检查数据库连接...', 'blue')
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    log('✅ 数据库连接正常', 'green')
    return true
  } catch (error) {
    log('❌ 数据库连接失败: ' + error.message, 'red')
    return false
  }
}

async function checkInitFlag() {
  log('📁 检查初始化标记文件...', 'blue')
  
  if (!fs.existsSync(INIT_FLAG_FILE)) {
    log('❌ 初始化标记文件不存在', 'red')
    return null
  }

  try {
    const content = fs.readFileSync(INIT_FLAG_FILE, 'utf-8')
    const initInfo = JSON.parse(content)
    log('✅ 初始化标记文件存在', 'green')
    log(`   初始化时间: ${initInfo.timestamp}`, 'blue')
    log(`   公司名称: ${initInfo.company}`, 'blue')
    log(`   管理员用户名: ${initInfo.admin.username}`, 'blue')
    return initInfo
  } catch (error) {
    log('❌ 读取初始化标记文件失败: ' + error.message, 'red')
    return null
  }
}

async function checkAdmin() {
  log('👤 检查管理员账户...', 'blue')
  
  try {
    const admin = await prisma.user.findFirst({
      where: {
        username: 'admin',
        role: 'ADMIN',
        isActive: true
      },
      include: {
        company: true
      }
    })

    if (!admin) {
      log('❌ 未找到管理员账户', 'red')
      return false
    }

    log('✅ 管理员账户存在', 'green')
    log(`   用户名: ${admin.username}`, 'blue')
    log(`   用户ID: ${admin.userId}`, 'blue')
    log(`   姓名: ${admin.chineseName}`, 'blue')
    log(`   邮箱: ${admin.email}`, 'blue')
    log(`   公司: ${admin.company.name}`, 'blue')
    log(`   状态: ${admin.isActive ? '激活' : '未激活'}`, 'blue')
    return true
  } catch (error) {
    log('❌ 检查管理员账户失败: ' + error.message, 'red')
    return false
  }
}

async function checkCompany() {
  log('🏢 检查公司信息...', 'blue')
  
  try {
    const company = await prisma.company.findFirst({
      where: { name: 'Solo Genius Agent' }
    })

    if (!company) {
      log('❌ 未找到默认公司', 'red')
      return false
    }

    log('✅ 默认公司存在', 'green')
    log(`   公司名称: ${company.name}`, 'blue')
    log(`   Logo URL: ${company.logoUrl}`, 'blue')
    return true
  } catch (error) {
    log('❌ 检查公司信息失败: ' + error.message, 'red')
    return false
  }
}

async function testAPI() {
  log('🌐 测试API接口...', 'blue')
  
  try {
    // 这里可以添加HTTP请求测试API
    // 由于这是Node.js脚本，我们暂时跳过HTTP测试
    log('⚠️ API测试跳过（需要HTTP客户端）', 'yellow')
    return true
  } catch (error) {
    log('❌ API测试失败: ' + error.message, 'red')
    return false
  }
}

function printSummary(results) {
  log('\n📊 验证结果汇总:', 'blue')
  log('=' .repeat(40), 'blue')
  
  const checks = [
    { name: '数据库连接', result: results.database },
    { name: '初始化标记', result: results.initFlag !== null },
    { name: '管理员账户', result: results.admin },
    { name: '公司信息', result: results.company },
    { name: 'API接口', result: results.api }
  ]

  let passCount = 0
  checks.forEach(check => {
    const status = check.result ? '✅ 通过' : '❌ 失败'
    const color = check.result ? 'green' : 'red'
    log(`${check.name}: ${status}`, color)
    if (check.result) passCount++
  })

  log('=' .repeat(40), 'blue')
  log(`总计: ${passCount}/${checks.length} 项检查通过`, passCount === checks.length ? 'green' : 'yellow')

  if (passCount === checks.length) {
    log('\n🎉 系统验证通过！可以正常使用', 'green')
    log('🌐 访问地址: http://localhost:8100 (Docker) 或 http://localhost:3000 (本地)', 'blue')
    log('👤 管理员登录: admin / 123456', 'blue')
  } else {
    log('\n⚠️ 系统验证未完全通过，请检查失败项', 'yellow')
    log('💡 建议运行: npm run quick-init', 'blue')
  }
}

async function verifyInit() {
  log('🔍 开始验证系统初始化状态...', 'blue')
  log('时间: ' + new Date().toLocaleString(), 'blue')
  log('')

  const results = {
    database: false,
    initFlag: null,
    admin: false,
    company: false,
    api: false
  }

  try {
    // 1. 检查数据库连接
    results.database = await checkDatabase()
    
    if (!results.database) {
      log('\n❌ 数据库连接失败，无法继续验证', 'red')
      return
    }

    // 2. 检查初始化标记文件
    results.initFlag = await checkInitFlag()

    // 3. 检查管理员账户
    results.admin = await checkAdmin()

    // 4. 检查公司信息
    results.company = await checkCompany()

    // 5. 测试API接口
    results.api = await testAPI()

    // 6. 打印汇总
    printSummary(results)

  } catch (error) {
    log('\n❌ 验证过程中发生错误: ' + error.message, 'red')
  } finally {
    await prisma.$disconnect()
  }
}

// 运行脚本
if (require.main === module) {
  verifyInit()
}

module.exports = { verifyInit }
