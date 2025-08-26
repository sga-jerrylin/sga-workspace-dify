"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/ui/file-upload"
import { Plus, Trash2, Users } from "lucide-react"
import type { AIAgent, Profile } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"
import { getCompanyAgents, getCompanyUsers } from "@/lib/database/queries"

interface AgentManagementProps {
  companyId?: string
}

export default function AgentManagement({ companyId }: AgentManagementProps) {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [userAccess, setUserAccess] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)

  // 新智能体表单
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    platform: "dify" as "dify" | "openai" | "custom",
    apiUrl: "",
    apiKey: "",
    avatarUrl: "",
    isActive: true,
  })

  useEffect(() => {
    loadAgents()
    loadUsers()
  }, [companyId])

  useEffect(() => {
    if (selectedAgent) {
      loadUserAccess(selectedAgent.id)
    }
  }, [selectedAgent])

  const loadAgents = async () => {
    if (!companyId) return

    setIsLoading(true)
    const { data } = await getCompanyAgents(companyId)
    if (data) {
      setAgents(data)
    }
    setIsLoading(false)
  }

  const loadUsers = async () => {
    if (!companyId) return

    const { data } = await getCompanyUsers(companyId)
    if (data) {
      setUsers(data)
    }
  }

  const loadUserAccess = async (agentId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from("user_agent_access").select("user_id").eq("agent_id", agentId)

    const accessMap: Record<string, boolean> = {}
    users.forEach((user) => {
      accessMap[user.id] = data?.some((access) => access.user_id === user.id) || false
    })
    setUserAccess(accessMap)
  }

  const handleAddAgent = async () => {
    if (!newAgent.name || !newAgent.apiUrl || !newAgent.apiKey) return

    const supabase = createClient()

    try {
      const testResponse = await fetch("/api/test-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: newAgent.platform,
          apiUrl: newAgent.apiUrl,
          apiKey: newAgent.apiKey,
          modelConfig: {},
        }),
      })

      const testResult = await testResponse.json()

      if (!testResult.success) {
        alert(`API连接测试失败: ${testResult.message}`)
        return
      }

      const { error } = await supabase.from("ai_agents").insert({
        name: newAgent.name,
        description: newAgent.description,
        platform: newAgent.platform,
        api_url: newAgent.apiUrl,
        api_key: newAgent.apiKey,
        avatar_url: newAgent.avatarUrl,
        company_id: companyId,
        is_active: newAgent.isActive,
      })

      if (error) throw error

      // 重置表单并刷新列表
      setNewAgent({
        name: "",
        description: "",
        platform: "dify",
        apiUrl: "",
        apiKey: "",
        avatarUrl: "",
        isActive: true,
      })
      setIsAddDialogOpen(false)
      loadAgents()

      alert("智能体添加成功！")
    } catch (error) {
      console.error("添加智能体失败:", error)
      alert("添加智能体失败，请检查配置")
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("确定要删除这个智能体吗？")) return

    const supabase = createClient()
    const { error } = await supabase.from("ai_agents").delete().eq("id", agentId)

    if (!error) {
      loadAgents()
    }
  }

  const handleToggleActive = async (agentId: string, isActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("ai_agents").update({ is_active: isActive }).eq("id", agentId)

    if (!error) {
      loadAgents()
    }
  }

  const openAccessDialog = (agent: AIAgent) => {
    setSelectedAgent(agent)
    setIsAccessDialogOpen(true)
  }

  const handleToggleUserAccess = async (userId: string, hasAccess: boolean) => {
    if (!selectedAgent) return

    const supabase = createClient()

    try {
      if (hasAccess) {
        // 添加访问权限
        const { error } = await supabase.from("user_agent_access").insert({
          user_id: userId,
          agent_id: selectedAgent.id,
        })
        if (error) throw error
      } else {
        // 移除访问权限
        const { error } = await supabase
          .from("user_agent_access")
          .delete()
          .eq("user_id", userId)
          .eq("agent_id", selectedAgent.id)
        if (error) throw error
      }

      // 更新本地状态
      setUserAccess((prev) => ({
        ...prev,
        [userId]: hasAccess,
      }))
    } catch (error) {
      console.error("更新权限失败:", error)
      alert("更新权限失败")
    }
  }

  const handleSaveAllAccess = async () => {
    if (!selectedAgent) return

    const supabase = createClient()

    try {
      // 先删除所有现有权限
      await supabase.from("user_agent_access").delete().eq("agent_id", selectedAgent.id)

      // 添加新的权限
      const accessesToAdd = Object.entries(userAccess)
        .filter(([_, hasAccess]) => hasAccess)
        .map(([userId]) => ({
          user_id: userId,
          agent_id: selectedAgent.id,
        }))

      if (accessesToAdd.length > 0) {
        const { error } = await supabase.from("user_agent_access").insert(accessesToAdd)
        if (error) throw error
      }

      alert("权限设置已保存")
      setIsAccessDialogOpen(false)
    } catch (error) {
      console.error("保存权限失败:", error)
      alert("保存权限失败")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">智能体管理</h2>
          <p className="text-gray-500">管理AI智能体和访问权限</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加智能体
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>添加新智能体</DialogTitle>
              <DialogDescription>配置一个新的AI智能体</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">智能体名称</Label>
                  <Input
                    id="name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="请输入智能体名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">平台类型</Label>
                  <Select
                    value={newAgent.platform}
                    onValueChange={(value: "dify" | "openai" | "custom") =>
                      setNewAgent({ ...newAgent, platform: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dify">Dify</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="custom">自定义</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="请输入智能体描述"
                />
              </div>
              <div className="space-y-2">
                <Label>智能体头像</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={newAgent.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback>{newAgent.name[0] || "A"}</AvatarFallback>
                  </Avatar>
                  <FileUpload
                    type="agent_avatar"
                    currentUrl={newAgent.avatarUrl}
                    onUpload={(url) => setNewAgent({ ...newAgent, avatarUrl: url })}
                    accept="image/*"
                  />
                </div>
                <p className="text-xs text-gray-500">支持 JPG、PNG 格式，建议尺寸 128x128px</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  value={newAgent.apiUrl}
                  onChange={(e) => setNewAgent({ ...newAgent, apiUrl: e.target.value })}
                  placeholder="请输入API地址"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={newAgent.apiKey}
                  onChange={(e) => setNewAgent({ ...newAgent, apiKey: e.target.value })}
                  placeholder="请输入API密钥"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newAgent.isActive}
                  onCheckedChange={(checked) => setNewAgent({ ...newAgent, isActive: checked })}
                />
                <Label htmlFor="isActive">启用智能体</Label>
              </div>
              <Button onClick={handleAddAgent} className="w-full">
                添加智能体
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 智能体列表 */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">加载中...</p>
            </CardContent>
          </Card>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">暂无智能体</p>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card key={agent.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={agent.avatar_url || ""} />
                      <AvatarFallback>{agent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-gray-500">{agent.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{agent.platform}</Badge>
                        <Badge variant={agent.is_active ? "default" : "outline"}>
                          {agent.is_active ? "启用" : "禁用"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openAccessDialog(agent)}>
                      <Users className="w-4 h-4 mr-2" />
                      权限设置
                    </Button>
                    <Switch
                      checked={agent.is_active}
                      onCheckedChange={(checked) => handleToggleActive(agent.id, checked)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAgent(agent.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 权限设置对话框 */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>设置访问权限</DialogTitle>
            <DialogDescription>选择可以访问 "{selectedAgent?.name}" 的用户</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>{user.display_name?.[0] || user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.display_name || user.username}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <Switch
                    checked={userAccess[user.id] || false}
                    onCheckedChange={(checked) => handleToggleUserAccess(user.id, checked)}
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleSaveAllAccess} className="w-full">
              保存权限设置
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
