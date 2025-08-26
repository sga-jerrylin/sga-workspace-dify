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
import { Plus, UserPlus, Trash2 } from "lucide-react"
import type { Profile } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"
import { getCompanyUsers } from "@/lib/database/queries"

interface UserManagementProps {
  companyId?: string
}

export default function UserManagement({ companyId }: UserManagementProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)

  // 单个用户添加表单
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "user" as "user" | "admin",
  })

  // 批量用户添加
  const [batchUsers, setBatchUsers] = useState("")

  useEffect(() => {
    loadUsers()
  }, [companyId])

  const loadUsers = async () => {
    if (!companyId) return

    setIsLoading(true)
    const { data } = await getCompanyUsers(companyId)
    if (data) {
      setUsers(data)
    }
    setIsLoading(false)
  }

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) return

    const supabase = createClient()

    try {
      // 创建认证用户
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: `${newUser.username}@company.local`,
        password: newUser.password,
        user_metadata: {
          username: newUser.username,
          display_name: newUser.displayName,
        },
      })

      if (authError) throw authError

      // 创建用户档案
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          username: newUser.username,
          display_name: newUser.displayName || newUser.username,
          company_id: companyId,
          role: newUser.role,
        })

        if (profileError) throw profileError
      }

      // 重置表单并刷新列表
      setNewUser({ username: "", password: "", displayName: "", role: "user" })
      setIsAddDialogOpen(false)
      loadUsers()
    } catch (error) {
      console.error("添加用户失败:", error)
    }
  }

  const handleBatchAdd = async () => {
    if (!batchUsers.trim()) return

    const lines = batchUsers.trim().split("\n")
    const supabase = createClient()

    for (const line of lines) {
      const [username, password, displayName, role] = line.split(",").map((s) => s.trim())
      if (!username || !password) continue

      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: `${username}@company.local`,
          password,
          user_metadata: {
            username,
            display_name: displayName,
          },
        })

        if (authError) throw authError

        if (authData.user) {
          await supabase.from("profiles").insert({
            id: authData.user.id,
            username,
            display_name: displayName || username,
            company_id: companyId,
            role: role === "admin" ? "admin" : "user",
          })
        }
      } catch (error) {
        console.error(`添加用户 ${username} 失败:`, error)
      }
    }

    setBatchUsers("")
    setIsBatchDialogOpen(false)
    loadUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("确定要删除这个用户吗？")) return

    const supabase = createClient()
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (!error) {
      loadUsers()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">用户管理</h2>
          <p className="text-gray-500">管理企业用户账户和权限</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新用户</DialogTitle>
                <DialogDescription>创建一个新的用户账户</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="请输入用户名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="请输入密码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">显示名称</Label>
                  <Input
                    id="displayName"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                    placeholder="请输入显示名称（可选）"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">角色</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "user" | "admin") => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">普通用户</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full">
                  添加用户
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                批量添加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>批量添加用户</DialogTitle>
                <DialogDescription>每行一个用户，格式：用户名,密码,显示名称,角色（admin/user）</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={batchUsers}
                  onChange={(e) => setBatchUsers(e.target.value)}
                  placeholder={`示例：
john,password123,John Doe,user
admin,admin123,管理员,admin
mary,pass456,Mary Smith,user`}
                  rows={10}
                />
                <Button onClick={handleBatchAdd} className="w-full">
                  批量添加用户
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">加载中...</p>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">暂无用户</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>{user.display_name?.[0] || user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.display_name || user.username}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "管理员" : "用户"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">创建于 {new Date(user.created_at).toLocaleDateString()}</p>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
