import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * 超简单的初始化检查API
 * 只检查数据库中是否有用户，如果没有用户就需要初始化
 */
export async function GET() {
  try {
    console.log('🔍 开始简单初始化检查...')
    
    // 连接数据库并检查用户数量
    await prisma.$connect()
    const userCount = await prisma.user.count()
    
    console.log(`📊 数据库中用户数量: ${userCount}`)
    
    const needsInit = userCount === 0
    
    console.log(`✨ 系统${needsInit ? '需要' : '不需要'}初始化`)
    
    return NextResponse.json({
      success: true,
      needsInit,
      userCount,
      message: needsInit ? '系统需要初始化' : '系统已初始化'
    })
    
  } catch (error) {
    console.error('❌ 初始化检查失败:', error)
    
    // 如果数据库连接失败，假设需要初始化
    return NextResponse.json(
      {
        success: false,
        needsInit: true,
        error: '数据库连接失败，请检查数据库配置',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
