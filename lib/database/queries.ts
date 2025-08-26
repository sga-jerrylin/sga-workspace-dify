import { createClient } from "@/lib/supabase/server"
import type { Profile, AIAgent, ChatSession, ChatMessage, Company, DatabaseResult } from "@/lib/types/database"

// 用户相关查询
export async function getUserProfile(userId: string): Promise<DatabaseResult<Profile>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    return { data, error: error?.message || null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getUserAccessibleAgents(userId: string): Promise<DatabaseResult<AIAgent[]>> {
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
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// 聊天相关查询
export async function getUserChatSessions(userId: string): Promise<DatabaseResult<ChatSession[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    return { data: data || [], error: error?.message || null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getChatMessages(sessionId: string): Promise<DatabaseResult<ChatMessage[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    return { data: data || [], error: error?.message || null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// 管理员相关查询
export async function getCompanyUsers(companyId: string): Promise<DatabaseResult<Profile[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })

    return { data: data || [], error: error?.message || null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getCompanyAgents(companyId: string): Promise<DatabaseResult<AIAgent[]>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ai_agents")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })

    return { data: data || [], error: error?.message || null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getCompanyInfo(companyId: string): Promise<DatabaseResult<Company>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).single()

    return { data, error: error?.message || null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
