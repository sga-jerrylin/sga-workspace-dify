-- 为常用查询添加索引以提高性能

-- 用户档案表索引
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- AI智能体表索引
CREATE INDEX IF NOT EXISTS idx_ai_agents_company_id ON ai_agents(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_is_active ON ai_agents(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_agents_platform ON ai_agents(platform);

-- 用户智能体访问权限表索引
CREATE INDEX IF NOT EXISTS idx_user_agent_access_user_id ON user_agent_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agent_access_agent_id ON user_agent_access(agent_id);

-- 聊天会话表索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_id ON chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at);

-- 聊天消息表索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- 企业表索引
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
