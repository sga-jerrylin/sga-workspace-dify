import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserProfile } from "@/lib/database/queries"
import AdminLayout from "@/components/admin/admin-layout"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // 获取用户信息并验证管理员权限
  const { data: profile } = await getUserProfile(data.user.id)
  if (!profile || profile.role !== "admin") {
    redirect("/workspace")
  }

  return <AdminLayout user={profile} />
}
