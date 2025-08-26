-- 创建企业表
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户档案表，关联到auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建AI智能体表
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('dify', 'openai', 'custom')),
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model_config JSONB DEFAULT '{}',
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户可见智能体关联表
CREATE TABLE IF NOT EXISTS user_agent_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

-- 创建聊天会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 企业表RLS策略
CREATE POLICY "Users can view their company" ON companies FOR SELECT USING (
  id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage their company" ON companies FOR ALL USING (
  id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 用户档案表RLS策略
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view company users" ON profiles FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage company users" ON profiles FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- AI智能体表RLS策略
CREATE POLICY "Users can view accessible agents" ON ai_agents FOR SELECT USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage company agents" ON ai_agents FOR ALL USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 用户智能体访问权限RLS策略
CREATE POLICY "Users can view their agent access" ON user_agent_access FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Admins can manage agent access" ON user_agent_access FOR ALL USING (
  user_id IN (SELECT id FROM profiles WHERE company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
);

-- 聊天会话RLS策略
CREATE POLICY "Users can manage their own sessions" ON chat_sessions FOR ALL USING (
  user_id = auth.uid()
);

-- 聊天消息RLS策略
CREATE POLICY "Users can manage messages in their sessions" ON chat_messages FOR ALL USING (
  session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);
