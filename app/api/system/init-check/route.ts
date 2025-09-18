import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const INIT_FLAG_FILE = path.join(process.cwd(), '.initialized')

export async function GET() {
  try {
    // 优先检查初始化标记文件
    let isInitialized = false
    let initInfo = null

    if (fs.existsSync(INIT_FLAG_FILE)) {
      try {
        const fileContent = fs.readFileSync(INIT_FLAG_FILE, 'utf-8')
        initInfo = JSON.parse(fileContent)
        isInitialized = initInfo.initialized === true
        console.log('从文件检查到系统已初始化')
      } catch (error) {
        console.warn('读取初始化标记文件失败:', error.message)
      }
    }

    // 如果文件检查失败，回退到数据库检查
    if (!isInitialized) {
      try {
        const userCount = await prisma.user.count({
          where: { isActive: true }
        })
        isInitialized = userCount > 0
        console.log('从数据库检查到系统初始化状态:', isInitialized)
      } catch (dbError) {
        console.error('数据库检查失败:', dbError.message)
        // 数据库连接失败时，假设系统未初始化
        isInitialized = false
      }
    }

    return NextResponse.json({
      success: true,
      isInitialized,
      message: isInitialized ? '系统已初始化' : '系统需要初始化',
      initInfo: initInfo ? {
        timestamp: initInfo.timestamp,
        company: initInfo.company
      } : null
    })
  } catch (error) {
    console.error('系统初始化检查失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: '系统初始化检查失败',
        isInitialized: false
      },
      { status: 500 }
    )
  }
}
