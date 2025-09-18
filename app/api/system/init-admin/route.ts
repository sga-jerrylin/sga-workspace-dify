import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始系统初始化...')

    const body = await request.json()
    const { userId, phone, password, chineseName, englishName, email, companyName } = body

    console.log('📝 接收到初始化请求:', {
      userId,
      phone: phone?.substring(0, 3) + '****',
      chineseName,
      englishName,
      email,
      companyName
    })

    // 验证必填字段
    if (!userId?.trim() || !phone?.trim() || !password?.trim() || !chineseName?.trim()) {
      console.log('❌ 必填字段验证失败')
      return NextResponse.json(
        { success: false, error: '用户ID、手机号、密码和中文姓名都是必填的' },
        { status: 400 }
      )
    }

    // 验证用户ID格式（更宽松）
    if (!/^[a-zA-Z0-9_]{2,30}$/.test(userId.trim())) {
      console.log('❌ 用户ID格式验证失败')
      return NextResponse.json(
        { success: false, error: '用户ID只能包含字母、数字和下划线，长度2-30位' },
        { status: 400 }
      )
    }

    // 验证手机号格式（更宽松，支持更多格式）
    if (!/^1[3-9]\d{9}$/.test(phone.trim()) && !/^\d{10,15}$/.test(phone.trim())) {
      console.log('❌ 手机号格式验证失败')
      return NextResponse.json(
        { success: false, error: '请输入正确的手机号格式（11位数字）' },
        { status: 400 }
      )
    }

    // 验证密码强度（更宽松）
    if (password.length < 4) {
      console.log('❌ 密码长度验证失败')
      return NextResponse.json(
        { success: false, error: '密码长度至少4位' },
        { status: 400 }
      )
    }

    try {
      console.log('🔍 检查系统是否已初始化...')

      // 简单检查：如果有任何用户就认为已初始化
      const existingUserCount = await prisma.user.count()
      console.log(`📊 现有用户数量: ${existingUserCount}`)

      if (existingUserCount > 0) {
        console.log('⚠️ 系统已经初始化')
        return NextResponse.json(
          { success: false, error: '系统已经初始化，不能重复创建管理员账户' },
          { status: 400 }
        )
      }

      console.log('🏢 创建或查找默认公司...')

      // 使用用户提供的公司名称或默认值
      const finalCompanyName = companyName?.trim() || 'Solo Genius Agent'

      // 创建默认公司（简化逻辑）
      let company = await prisma.company.findFirst({
        where: { name: finalCompanyName }
      })

      if (!company) {
        console.log('📝 创建新公司:', finalCompanyName)
        company = await prisma.company.create({
          data: {
            name: finalCompanyName,
            logoUrl: '/placeholder-logo.svg'
          }
        })
        console.log('✅ 公司创建成功:', company.id)
      } else {
        console.log('✅ 找到现有公司:', company.id)
      }

      console.log('👤 创建管理员用户...')

      // 创建密码哈希
      const passwordHash = await bcrypt.hash(password, 10)

      // 创建管理员用户
      const finalEmail = email?.trim() || `${userId.trim()}@sologenai.com`
      const finalEnglishName = englishName?.trim() || 'System Admin'

      const adminUser = await prisma.user.create({
        data: {
          companyId: company.id,
          username: userId.trim(),
          userId: userId.trim(),
          phone: phone.trim(),
          passwordHash,
          chineseName: chineseName.trim(),
          englishName: finalEnglishName,
          email: finalEmail,
          role: 'ADMIN',
          isActive: true,
        }
      })

      console.log('🎉 管理员用户创建成功!')
      console.log('📋 用户信息:', {
        id: adminUser.id,
        username: adminUser.username,
        userId: adminUser.userId,
        role: adminUser.role
      })

      console.log('✅ 系统初始化完成!')

      return NextResponse.json({
        success: true,
        message: '🎉 系统初始化成功！管理员账户已创建',
        data: {
          user: {
            id: adminUser.id,
            username: adminUser.username,
            userId: adminUser.userId,
            email: adminUser.email,
            displayName: adminUser.chineseName,
            role: adminUser.role
          },
          company: {
            id: company.id,
            name: company.name
          }
        }
      })

    } catch (dbError) {
      console.error('❌ 数据库操作失败:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: '数据库操作失败，请检查数据库连接和配置',
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ 系统初始化失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: '系统初始化失败，请稍后重试',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
