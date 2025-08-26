"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] 尝试登录用户:", username)

      const email = `${username}@company.local`

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.log("[v0] 登录失败:", signInError)
        throw new Error("用户名或密码错误")
      }

      console.log("[v0] 登录成功，用户ID:", authData.user?.id)

      if (authData.user) {
        // 简单的角色判断：admin用户名对应admin角色
        const role = username === "admin" ? "admin" : "user"
        console.log("[v0] 用户角色:", role)

        if (role === "admin") {
          router.push("/admin")
        } else {
          router.push("/workspace")
        }
      }
    } catch (error: unknown) {
      console.log("[v0] 登录错误:", error)
      setError(error instanceof Error ? error.message : "登录失败")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* 动态网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />

        {/* 浮动几何形状 */}
        <div
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-bounce"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-lg blur-lg animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-40 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-lg animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "2s" }}
        />

        {/* 光线效果 */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-pulse" />
        <div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />

        {/* 大型背景光晕 */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
              <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
              {/* 脉冲环 */}
              <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-ping" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
              AI 工作空间
            </h1>
            <p className="text-blue-200/80 text-lg">企业智能化平台</p>
            <div className="flex items-center justify-center mt-4 gap-2">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-blue-400" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-blue-400" />
            </div>
          </div>

          <Card className="border border-blue-500/20 shadow-2xl bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

            <CardHeader className="text-center pb-6 relative z-10">
              <CardTitle className="text-xl font-semibold text-white">登录您的账户</CardTitle>
              <CardDescription className="text-blue-200/70">请输入您的用户名和密码</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-sm font-medium text-blue-100">
                      用户名
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="请输入用户名"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-12 bg-slate-800/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-sm font-medium text-blue-100">
                      密码
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-slate-800/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm"
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 p-3 rounded-lg backdrop-blur-sm">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 relative overflow-hidden group"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        登录中...
                      </div>
                    ) : (
                      "登录"
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-blue-500/20">
                <p className="text-xs text-blue-300/60 text-center mb-3">演示账户</p>
                <div className="text-xs text-blue-200/80 space-y-1 text-center bg-slate-800/30 border border-blue-500/20 p-4 rounded-lg backdrop-blur-sm">
                  <p>
                    <span className="font-medium text-blue-100">管理员：</span> admin / admin123
                  </p>
                  <p>
                    <span className="font-medium text-blue-100">普通用户：</span> user / user123
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <Link href="/setup" className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors">
                    首次使用？点击创建演示账户
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
