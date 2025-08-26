"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const createDemoUsers = async () => {
    setLoading(true)
    setMessage("")

    const supabase = createClient()

    try {
      console.log("[v0] 创建管理员用户...")
      const { data: adminData, error: adminError } = await supabase.auth.signUp({
        email: "admin@company.local",
        password: "admin123",
        options: {
          data: {
            username: "admin",
            display_name: "系统管理员",
            role: "admin",
          },
        },
      })

      if (adminError) {
        console.log("[v0] 管理员创建错误:", adminError)
        throw adminError
      }

      console.log("[v0] 创建普通用户...")
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: "user@company.local",
        password: "user123",
        options: {
          data: {
            username: "user",
            display_name: "测试用户",
            role: "user",
          },
        },
      })

      if (userError) {
        console.log("[v0] 用户创建错误:", userError)
        throw userError
      }

      setMessage("演示用户创建成功！\n管理员: admin / admin123\n用户: user / user123")
      console.log("[v0] 所有演示用户创建成功")
    } catch (error: any) {
      console.log("[v0] 创建用户失败:", error)
      setMessage(`创建失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-500/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Card className="w-full max-w-md relative z-10 border border-blue-500/20 shadow-2xl bg-slate-900/80 backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            系统设置
          </CardTitle>
          <CardDescription className="text-blue-200/70">创建演示用户账户</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={createDemoUsers}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                创建中...
              </div>
            ) : (
              "创建演示用户"
            )}
          </Button>

          {message && (
            <div className="p-4 bg-slate-800/50 border border-blue-500/30 rounded-lg backdrop-blur-sm">
              <pre className="text-sm whitespace-pre-wrap text-blue-100">{message}</pre>
            </div>
          )}

          <div className="text-sm text-blue-200/80 bg-slate-800/30 border border-blue-500/20 p-4 rounded-lg backdrop-blur-sm">
            <p className="font-medium text-blue-100 mb-2">这将创建以下演示账户：</p>
            <ul className="space-y-1">
              <li>
                • <span className="font-medium">管理员:</span> admin / admin123
              </li>
              <li>
                • <span className="font-medium">用户:</span> user / user123
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-blue-500/20">
            <Link
              href="/auth/login"
              className="block w-full text-center py-3 text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              返回登录页面
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
