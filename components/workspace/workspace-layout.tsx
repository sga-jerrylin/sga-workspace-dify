"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Plus, LogOut, Bot, Settings } from "lucide-react"
import type { Profile, AIAgent, ChatSession } from "@/lib/types/database"
import ChatInterface from "./chat-interface"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface WorkspaceLayoutProps {
  user: Profile
  agents: AIAgent[]
  sessions: ChatSession[]
}

export default function WorkspaceLayout({ user, agents, sessions }: WorkspaceLayoutProps) {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [showAgents, setShowAgents] = useState(true)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleNewChat = (agent: AIAgent) => {
    setSelectedAgent(agent)
    setSelectedSession(null)
    setShowAgents(false)
  }

  const handleSelectSession = (session: ChatSession) => {
    const agent = agents.find((a) => a.id === session.agent_id)
    if (agent) {
      setSelectedAgent(agent)
      setSelectedSession(session)
      setShowAgents(false)
    }
  }

  const goToAdmin = () => {
    router.push("/admin")
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左侧边栏 */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* 用户信息 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback>{user.display_name?.[0] || user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{user.display_name || user.username}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">AI工作空间</p>
                {user.role === "admin" && (
                  <Badge variant="secondary" className="text-xs">
                    管理员
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex space-x-1">
              {user.role === "admin" && (
                <Button variant="ghost" size="sm" onClick={goToAdmin} title="管理后台">
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} title="退出登录">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <div className="p-4">
          <div className="flex space-x-2">
            <Button
              variant={showAgents ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAgents(true)}
              className="flex-1"
            >
              <Bot className="w-4 h-4 mr-2" />
              智能体
            </Button>
            <Button
              variant={!showAgents ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAgents(false)}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              聊天
            </Button>
          </div>
        </div>

        <Separator />

        {/* 内容区域 */}
        <ScrollArea className="flex-1 p-4">
          {showAgents ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">可用智能体</h4>
              {agents.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">暂无可用的智能体</p>
                  {user.role === "admin" && (
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={goToAdmin}>
                      前往管理后台配置
                    </Button>
                  )}
                </div>
              ) : (
                agents.map((agent) => (
                  <Card key={agent.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={agent.avatar_url || ""} />
                          <AvatarFallback>{agent.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{agent.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {agent.platform}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {agent.description && (
                      <CardContent className="pt-0">
                        <CardDescription className="text-xs">{agent.description}</CardDescription>
                      </CardContent>
                    )}
                    <CardContent className="pt-0">
                      <Button size="sm" className="w-full" onClick={() => handleNewChat(agent)}>
                        <Plus className="w-4 h-4 mr-2" />
                        开始对话
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">聊天历史</h4>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">暂无聊天记录</p>
                </div>
              ) : (
                sessions.map((session) => {
                  const agent = agents.find((a) => a.id === session.agent_id)
                  return (
                    <Card
                      key={session.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelectSession(session)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={agent?.avatar_url || ""} />
                            <AvatarFallback>{agent?.name[0] || "A"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-sm truncate">{session.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {agent?.name} • {new Date(session.updated_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {selectedAgent ? (
          <ChatInterface
            agent={selectedAgent}
            session={selectedSession}
            onBack={() => {
              setSelectedAgent(null)
              setSelectedSession(null)
              setShowAgents(true)
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">欢迎使用AI工作空间</h3>
              <p className="text-gray-500 mb-4">选择一个智能体开始对话，或查看您的聊天历史</p>
              <Button onClick={() => setShowAgents(true)}>
                <Bot className="w-4 h-4 mr-2" />
                查看智能体
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
