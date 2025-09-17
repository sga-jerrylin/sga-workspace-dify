/**
 * 用户Agent权限 API
 * GET /api/user/agents - 获取当前用户有权限访问的Agent列表
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withAuth } from '@/lib/auth/middleware'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

// GET /api/user/agents - 获取当前用户有权限访问的Agent列表
export const GET = withAuth(async (request) => {
  try {
    const user = request.user!

    // 如果是管理员，返回所有Agent
    if (user.role === 'ADMIN') {
      const allAgents = await prisma.agent.findMany({
        where: {
          companyId: user.companyId,
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              icon: true,
              sortOrder: true,
            }
          }
        },
        orderBy: [
          { department: { sortOrder: 'asc' } },
          { sortOrder: 'asc' },
          { createdAt: 'desc' }
        ]
      })

      // 处理Agent数据，提取平台配置到兼容字段
      const processedAgents = allAgents.map(agent => {
        const processed = { ...agent }

        // 强制确保所有字符串字段都是字符串 - 终极修复
        const ensureString = (value: any, fieldName: string) => {
          if (value === null || value === undefined) return ''
          if (typeof value === 'string') return value
          if (typeof value === 'object') {
            console.warn(`[API] ${fieldName}是对象，强制转换:`, {
              original: value,
              type: typeof value,
              constructor: value?.constructor?.name
            })
            return JSON.stringify(value)
          }
          return String(value)
        }

        processed.chineseName = ensureString(processed.chineseName, 'chineseName')
        processed.englishName = ensureString(processed.englishName, 'englishName')
        processed.position = ensureString(processed.position, 'position')

        console.log(`[API] 处理Agent ${agent.chineseName}:`, {
          id: agent.id,
          platform: agent.platform,
          platformConfig: agent.platformConfig,
          originalDifyUrl: agent.difyUrl,
          originalDifyKey: agent.difyKey ? '***' : undefined,
          // 详细调试chineseName
          chineseName: agent.chineseName,
          chineseNameType: typeof agent.chineseName,
          chineseNameConstructor: agent.chineseName?.constructor?.name,
          chineseNameJSON: JSON.stringify(agent.chineseName),
          isString: typeof agent.chineseName === 'string',
          rawAgentKeys: Object.keys(agent)
        })

        // 如果是DIFY平台，提取配置到兼容字段
        if (agent.platform === 'DIFY' && agent.platformConfig) {
          const config = agent.platformConfig as any
          processed.difyUrl = config.baseUrl || agent.difyUrl
          processed.difyKey = config.apiKey || agent.difyKey

          console.log(`[API] 提取后的配置:`, {
            difyUrl: processed.difyUrl,
            difyKey: processed.difyKey ? '***' : undefined
          })
        }

        return processed
      })

      // 获取部门列表
      const departments = await prisma.department.findMany({
        where: { companyId: user.companyId },
        include: {
          agents: {
            select: {
              id: true,
              chineseName: true,
              position: true,
              isOnline: true,
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      })

      // 统计每个部门的Agent数量
      const departmentsWithStats = departments.map(dept => ({
        ...dept,
        agentCount: dept.agents.length,
        onlineAgentCount: dept.agents.filter(agent => agent.isOnline).length,
      }))

      return NextResponse.json({
        data: {
          agents: processedAgents,
          departments: departmentsWithStats,
          isAdmin: true
        },
        message: '获取Agent列表成功'
      }, { headers: corsHeaders })
    }

    // 普通用户：获取有权限的Agent
    const userAgentPermissions = await prisma.userAgentPermission.findMany({
      where: {
        userId: user.userId, // 使用userId而不是id
      },
      include: {
        agent: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                icon: true,
                sortOrder: true,
              }
            }
          }
        }
      }
    })

    const userAgents = userAgentPermissions.map(p => p.agent)

    // 处理Agent数据，提取平台配置到兼容字段
    const processedUserAgents = userAgents.map(agent => {
      const processed = { ...agent }

      // 强制确保所有字符串字段都是字符串 - 终极修复
      const ensureString = (value: any, fieldName: string) => {
        if (value === null || value === undefined) return ''
        if (typeof value === 'string') return value
        if (typeof value === 'object') {
          console.warn(`[API] 用户Agent ${fieldName}是对象，强制转换:`, {
            original: value,
            type: typeof value,
            constructor: value?.constructor?.name
          })
          return JSON.stringify(value)
        }
        return String(value)
      }

      processed.chineseName = ensureString(processed.chineseName, 'chineseName')
      processed.englishName = ensureString(processed.englishName, 'englishName')
      processed.position = ensureString(processed.position, 'position')

      console.log(`[API] 处理用户Agent ${agent.chineseName}:`, {
        id: agent.id,
        platform: agent.platform,
        platformConfig: agent.platformConfig,
        originalDifyUrl: agent.difyUrl,
        originalDifyKey: agent.difyKey ? '***' : undefined
      })

      // 如果是DIFY平台，提取配置到兼容字段
      if (agent.platform === 'DIFY' && agent.platformConfig) {
        const config = agent.platformConfig as any
        processed.difyUrl = config.baseUrl || agent.difyUrl
        processed.difyKey = config.apiKey || agent.difyKey

        console.log(`[API] 提取后的用户Agent配置:`, {
          difyUrl: processed.difyUrl,
          difyKey: processed.difyKey ? '***' : undefined
        })
      }

      return processed
    })

    // 获取用户有权限的部门（去重）
    const userDepartmentIds = [...new Set(userAgents.map(agent => agent.departmentId))]
    const userDepartments = await prisma.department.findMany({
      where: {
        id: { in: userDepartmentIds },
        companyId: user.companyId,
      },
      include: {
        agents: {
          where: {
            id: { in: userAgents.map(agent => agent.id) }
          },
          select: {
            id: true,
            chineseName: true,
            position: true,
            isOnline: true,
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // 统计每个部门的Agent数量
    const departmentsWithStats = userDepartments.map(dept => ({
      ...dept,
      agentCount: dept.agents.length,
      onlineAgentCount: dept.agents.filter(agent => agent.isOnline).length,
    }))

    return NextResponse.json({
      data: {
        agents: processedUserAgents,
        departments: departmentsWithStats,
        isAdmin: false
      },
      message: '获取Agent列表成功'
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('获取用户Agent列表失败:', error)
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取Agent列表失败'
        }
      },
      { status: 500, headers: corsHeaders }
    )
  } finally {
    await prisma.$disconnect()
  }
})
