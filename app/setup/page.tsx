'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, User, Mail, Lock, Briefcase, Building } from 'lucide-react'

export default function SystemSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    userId: 'admin',
    phone: '13800000000',
    password: '123456'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // 基本验证
    if (!formData.userId.trim()) {
      setError('用户ID不能为空')
      setIsLoading(false)
      return
    }

    if (!formData.phone.trim()) {
      setError('手机号不能为空')
      setIsLoading(false)
      return
    }

    if (!formData.password.trim()) {
      setError('密码不能为空')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 4) {
      setError('密码长度至少4位')
      setIsLoading(false)
      return
    }

    try {
      console.log('开始系统初始化...', { userId: formData.userId })

      const response = await fetch('/api/system/init-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId.trim(),
          phone: formData.phone.trim(),
          password: formData.password
        }),
      })

      const data = await response.json()
      console.log('初始化响应:', data)

      if (response.ok && data.success) {
        // 初始化成功，等待一下再跳转
        console.log('系统初始化成功，准备跳转到登录页面')
        setTimeout(() => {
          router.push('/auth/login?message=' + encodeURIComponent('系统初始化成功！请使用管理员账户登录'))
        }, 1000)
      } else {
        const errorMsg = data.error || data.message || '系统初始化失败'
        console.error('初始化失败:', errorMsg)
        setError(errorMsg)
      }
    } catch (error) {
      console.error('系统初始化网络错误:', error)
      setError('网络连接失败，请检查网络后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 动画背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo 预留位置 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-blue-500/25">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">🎉 欢迎使用 AI 工作空间</h1>
          <p className="text-blue-200/70 mt-2">请创建第一个管理员账户来开始使用系统</p>
          <div className="mt-4 text-sm text-blue-300/60">
            <p>✨ 这是一个一次性设置，完成后即可正常使用系统</p>
          </div>
        </div>

        <Card className="border border-blue-500/20 shadow-2xl bg-slate-900/80 backdrop-blur-xl">
          {/* 顶部光线效果 */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              <Shield className="w-5 h-5 text-blue-400" />
              创建管理员账户
            </CardTitle>
            <CardDescription className="text-blue-200/70">
              请填写管理员账户信息，这将是系统的超级管理员
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="userId" className="flex items-center gap-2 text-blue-200">
                  <User className="w-4 h-4" />
                  用户ID
                </Label>
                <Input
                  id="userId"
                  name="userId"
                  type="text"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="输入用户ID（用于登录）"
                  required
                  disabled={isLoading}
                  className="bg-slate-800/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20"
                />
                <p className="text-xs text-blue-300/60">建议使用 admin 或您的英文名</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-blue-200">
                  <User className="w-4 h-4" />
                  手机号
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="输入手机号"
                  required
                  disabled={isLoading}
                  className="bg-slate-800/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-blue-200">
                  <Lock className="w-4 h-4" />
                  密码
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="输入密码（至少4位）"
                  required
                  disabled={isLoading}
                  className="bg-slate-800/50 border-blue-500/30 text-white placeholder:text-blue-300/50 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    初始化中...
                  </>
                ) : (
                  '创建管理员账户'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-blue-200/70">
          <p>💡 创建成功后，系统将自动跳转到登录页面</p>
          <p className="mt-1">🔐 请记住您设置的用户名和密码</p>
        </div>
      </div>
    </div>
  )
}
