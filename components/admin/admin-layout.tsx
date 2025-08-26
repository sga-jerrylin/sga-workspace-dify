"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Bot, Building, Settings } from "lucide-react"
import type { Profile } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import UserManagement from "./user-management"
import AgentManagement from "./agent-management"
import CompanySettings from "./company-settings"

interface AdminLayoutProps {
  user: Profile
}

export default function AdminLayout({ user }: AdminLayoutProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const goToWorkspace = () => {
    router.push("/workspace")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">管理后台</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={goToWorkspace}>
                返回工作空间
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback>{user.display_name?.[0] || user.username[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.display_name || user.username}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    管理员
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>用户管理</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>智能体管理</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>企业设置</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement companyId={user.company_id} />
          </TabsContent>

          <TabsContent value="agents">
            <AgentManagement companyId={user.company_id} />
          </TabsContent>

          <TabsContent value="company">
            <CompanySettings companyId={user.company_id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
