import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile, getUserAccessibleAgents, getUserChatSessions } from "@/lib/database/queries"
import WorkspaceLayout from "@/components/workspace/workspace-layout"

export default async function WorkspacePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // 获取用户信息
  const { data: profile } = await getUserProfile(data.user.id)
  if (!profile) {
    redirect("/auth/login")
  }

  // 获取用户可访问的AI智能体
  const { data: agents } = await getUserAccessibleAgents(data.user.id)

  // 获取用户的聊天会话
  const { data: sessions } = await getUserChatSessions(data.user.id)

  return <WorkspaceLayout user={profile} agents={agents || []} sessions={sessions || []} />
}
