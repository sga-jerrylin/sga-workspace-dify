import { createClient } from "@/lib/supabase/server"

export async function checkUserPermission(userId: string, agentId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_agent_access")
      .select("id")
      .eq("user_id", userId)
      .eq("agent_id", agentId)
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

export async function checkAdminPermission(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

    return !error && data?.role === "admin"
  } catch {
    return false
  }
}

export async function getUserAccessibleAgents(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("ai_agents")
      .select(`
        *,
        user_agent_access!inner(user_id)
      `)
      .eq("user_agent_access.user_id", userId)
      .eq("is_active", true)

    return { data: data || [], error: error?.message || null }
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function grantUserAccess(userId: string, agentId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("user_agent_access").insert({ user_id: userId, agent_id: agentId })

    return !error
  } catch {
    return false
  }
}

export async function revokeUserAccess(userId: string, agentId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("user_agent_access").delete().eq("user_id", userId).eq("agent_id", agentId)

    return !error
  } catch {
    return false
  }
}
