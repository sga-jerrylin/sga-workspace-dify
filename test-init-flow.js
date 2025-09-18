/**
 * 测试初始化流程脚本
 * 验证扩展后的管理员初始化功能
 */

const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:8100'

async function testInitFlow() {
  console.log('🧪 开始测试初始化流程...')
  console.log('=' .repeat(50))

  try {
    // 1. 测试初始化检查API
    console.log('1️⃣ 测试初始化检查API...')
    const checkResponse = await fetch(`${BASE_URL}/api/system/simple-init-check`)
    const checkData = await checkResponse.json()
    
    console.log('初始化检查结果:', checkData)
    
    if (!checkData.success) {
      console.log('❌ 初始化检查失败')
      return
    }

    if (!checkData.needsInit) {
      console.log('⚠️ 系统已经初始化，请先清理数据库')
      return
    }

    console.log('✅ 系统需要初始化，继续测试...')

    // 2. 测试管理员创建API（使用新的字段）
    console.log('\n2️⃣ 测试管理员创建API...')
    
    const adminData = {
      userId: 'testadmin',
      phone: '13800138001',
      password: 'test123456',
      chineseName: '测试管理员',
      englishName: 'Test Admin',
      email: 'testadmin@test.com',
      companyName: '测试公司'
    }

    const createResponse = await fetch(`${BASE_URL}/api/system/init-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    })

    const createData = await createResponse.json()
    console.log('管理员创建结果:', createData)

    if (!createData.success) {
      console.log('❌ 管理员创建失败:', createData.error)
      return
    }

    console.log('✅ 管理员创建成功!')
    console.log('管理员信息:', {
      用户名: createData.data.user.username,
      用户ID: createData.data.user.userId,
      邮箱: createData.data.user.email,
      显示名: createData.data.user.displayName,
      角色: createData.data.user.role,
      公司: createData.data.company.name
    })

    // 3. 验证初始化状态
    console.log('\n3️⃣ 验证初始化状态...')
    const verifyResponse = await fetch(`${BASE_URL}/api/system/simple-init-check`)
    const verifyData = await verifyResponse.json()
    
    if (verifyData.success && !verifyData.needsInit) {
      console.log('✅ 初始化状态验证成功，系统已完成初始化')
    } else {
      console.log('❌ 初始化状态验证失败')
    }

    console.log('\n🎉 测试完成！')
    console.log('=' .repeat(50))
    console.log('现在可以访问 http://localhost:8100 查看初始化页面')
    console.log('或者访问 http://localhost:8100/auth/login 进行登录')

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  testInitFlow()
}

module.exports = { testInitFlow }
