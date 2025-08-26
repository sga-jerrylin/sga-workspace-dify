"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import type { AIAgent, ChatSession, ChatMessage } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"
import { getChatMessages } from "@/lib/database/queries"

interface ChatInterfaceProps {
  agent: AIAgent
  session: ChatSession | null
  onBack: () => void
}

export default function ChatInterface({ agent, session, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(session)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 加载聊天消息
  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id)
    } else {
      setMessages([])
    }
  }, [currentSession])

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const loadMessages = async (sessionId: string) => {
    const { data } = await getChatMessages(sessionId)
    if (data) {
      setMessages(data)
    }
  }

  const createNewSession = async (): Promise<string | null> => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        agent_id: agent.id,
        title: `与${agent.name}的对话`,
      })
      .select()
      .single()

    if (error) {
      console.error("创建会话失败:", error)
      return null
    }

    setCurrentSession(data)
    return data.id
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      // 确保有会话
      let sessionId = currentSession?.id
      if (!sessionId) {
        sessionId = await createNewSession()
        if (!sessionId) {
          throw new Error("无法创建聊天会话")
        }
      }

      const supabase = createClient()

      // 添加用户消息
      const { error: userMessageError } = await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: userMessage,
      })

      if (userMessageError) throw userMessageError

      // 更新本地消息列表
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        session_id: sessionId,
        role: "user",
        content: userMessage,
        metadata: {},
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newUserMessage])

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          agentId: agent.id,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("AI API调用失败")
      }

      const { response: aiResponse } = await response.json()

      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: sessionId!,
        role: "assistant",
        content: aiResponse,
        metadata: {},
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newAiMessage])
      setIsLoading(false)
    } catch (error) {
      console.error("发送消息失败:", error)

      // 显示错误消息
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        session_id: currentSession?.id || "",
        role: "assistant",
        content: "抱歉，发送消息时出现错误，请稍后再试。",
        metadata: {},
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar>
            <AvatarImage src={agent.avatar_url || ""} />
            <AvatarFallback>{agent.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.platform} • 在线</p>
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>开始与{agent.name}对话吧！</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex space-x-2 max-w-[70%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <Avatar className="w-8 h-8">
                  {message.role === "user" ? (
                    <AvatarFallback>我</AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={agent.avatar_url || ""} />
                      <AvatarFallback>{agent.name[0]}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <Card
                  className={`p-3 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-white dark:bg-gray-800"}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-2 max-w-[70%]">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={agent.avatar_url || ""} />
                  <AvatarFallback>{agent.name[0]}</AvatarFallback>
                </Avatar>
                <Card className="p-3 bg-white dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-gray-500">正在思考...</p>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`向${agent.name}发送消息...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
