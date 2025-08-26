export interface Company {
  id: string
  name: string
  logo_url?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  username: string
  display_name?: string
  company_id?: string
  role: "user" | "admin"
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AIAgent {
  id: string
  name: string
  description?: string
  avatar_url?: string
  platform: "dify" | "openai" | "custom"
  api_url: string
  api_key: string
  model_config: Record<string, any>
  company_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserAgentAccess {
  id: string
  user_id: string
  agent_id: string
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  agent_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: "user" | "assistant"
  content: string
  metadata: Record<string, any>
  created_at: string
}

// 数据库操作结果类型
export interface DatabaseResult<T> {
  data: T | null
  error: string | null
}

// 分页参数
export interface PaginationParams {
  page?: number
  limit?: number
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
