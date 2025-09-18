'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Database, AlertCircle, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [status, setStatus] = useState<'checking' | 'need-init' | 'initialized' | 'error'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSystemInit = async () => {
      try {
        console.log('🚀 检查系统初始化状态...')

        // 直接检查系统是否需要初始化
        const response = await fetch('/api/system/simple-init-check', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })

        const data = await response.json()
        console.log('初始化检查结果:', data)

        if (response.ok && data.success) {
          if (data.needsInit) {
            // 需要初始化，跳转到初始化页面
            console.log('✨ 系统需要初始化，跳转到初始化页面')
            setStatus('need-init')
            setTimeout(() => router.push('/setup'), 1000)
          } else {
            // 已经初始化，跳转到登录页面
            console.log('✅ 系统已初始化，跳转到登录页面')
            setStatus('initialized')
            setTimeout(() => router.push('/auth/login'), 1000)
          }
        } else {
          // 检查失败，显示错误
          throw new Error(data.error || '系统检查失败')
        }
      } catch (error) {
        console.error('❌ 系统检查失败:', error)
        setStatus('error')
        const errorMsg = error instanceof Error ? error.message : '系统检查失败'
        setError(errorMsg)
      } finally {
        setIsChecking(false)
      }
    }

    // 延迟一点开始检查，确保页面已加载
    const timer = setTimeout(checkSystemInit, 800)
    return () => clearTimeout(timer)
  }, [router])

  if (isChecking || status === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">正在检查系统状态...</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <Database className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">连接数据库中</span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">系统检查失败</h1>
          <p className="text-gray-600 mb-4">无法连接到数据库或检查系统状态</p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-red-700 font-medium mb-2">错误信息：</p>
            <p className="text-sm text-red-600 font-mono">{error}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">请检查：</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Docker 容器是否正常运行</li>
              <li>• PostgreSQL 数据库是否启动</li>
              <li>• 网络连接是否正常</li>
              <li>• 环境变量配置是否正确</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新检查
          </button>
        </div>
      </div>
    )
  }

  if (status === 'need-init') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">⚡</span>
          </div>
          <p className="text-gray-600">系统需要初始化，正在跳转到设置页面...</p>
        </div>
      </div>
    )
  }

  if (status === 'initialized') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">系统已初始化，正在跳转到登录页面...</p>
        </div>
      </div>
    )
  }

  return null
}
