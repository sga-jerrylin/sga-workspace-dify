import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendToDify, sendToCustomAPI } from "@/lib/api/dify"

export async function POST(request: NextRequest) {
  try {
    const { message, agentId, sessionId } = await request.json()

    // 验证请求参数
    if (!message || !agentId || !sessionId) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
    }

    const supabase = await createClient()

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 获取智能体信息
    const { data: agent, error: agentError } = await supabase.from("ai_agents").select("*").eq("id", agentId).single()

    if (agentError || !agent) {
      return NextResponse.json({ error: "智能体不存在" }, { status: 404 })
    }

    // 验证智能体是否启用
    if (!agent.is_active) {
      return NextResponse.json({ error: "智能体已禁用" }, { status: 403 })
    }

    // 验证用户是否有权限访问该智能体
    const { data: access } = await supabase
      .from("user_agent_access")
      .select("*")
      .eq("user_id", user.id)
      .eq("agent_id", agentId)
      .single()

    if (!access) {
      return NextResponse.json({ error: "无权限访问该智能体" }, { status: 403 })
    }

    // 验证会话是否属于当前用户
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: "会话不存在或无权限访问" }, { status: 403 })
    }

    // 根据平台调用相应的API
    let response
    if (agent.platform === "dify") {
      // 获取会话的conversation_id（如果有的话）
      const { data: lastMessage } = await supabase
        .from("chat_messages")
        .select("metadata")
        .eq("session_id", sessionId)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      const conversationId = lastMessage?.metadata?.conversation_id

      response = await sendToDify(agent.api_url, agent.api_key, message, conversationId)
    } else {
      response = await sendToCustomAPI(agent.api_url, agent.api_key, message, agent.model_config)
    }

    // 保存AI回复到数据库
    const { error: messageError } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: response.answer,
      metadata: {
        conversation_id: response.conversation_id,
        message_id: response.message_id,
        agent_platform: agent.platform,
      },
    })

    if (messageError) {
      console.error("保存消息失败:", messageError)
      // 不阻断响应，只记录错误
    }

    // 更新会话的最后更新时间
    await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId)

    return NextResponse.json({
      response: response.answer,
      conversation_id: response.conversation_id,
      message_id: response.message_id,
    })
  } catch (error) {
    console.error("聊天API错误:", error)
    return NextResponse.json(
      {
        error: "服务器内部错误",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 },
    )
  }
}
