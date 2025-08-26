-- 删除有问题的RLS策略
DROP POLICY IF EXISTS "Admins can view company users" ON profiles;
DROP POLICY IF EXISTS "Admins can manage company users" ON profiles;
DROP POLICY IF EXISTS "Admins can manage company agents" ON ai_agents;
DROP POLICY IF EXISTS "Admins can manage agent access" ON user_agent_access;

-- 创建安全函数来获取当前用户信息
CREATE OR REPLACE FUNCTION get_current_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- 重新创建修复后的RLS策略
-- 用户档案表RLS策略 - 修复无限递归
CREATE POLICY "Admins can view company users" ON profiles FOR SELECT USING (
  is_admin() AND company_id = get_current_user_company_id()
);

CREATE POLICY "Admins can manage company users" ON profiles FOR ALL USING (
  is_admin() AND company_id = get_current_user_company_id()
);

-- AI智能体表RLS策略 - 修复无限递归
CREATE POLICY "Admins can manage company agents" ON ai_agents FOR ALL USING (
  is_admin() AND company_id = get_current_user_company_id()
);

-- 用户智能体访问权限RLS策略 - 修复无限递归
CREATE POLICY "Admins can manage agent access" ON user_agent_access FOR ALL USING (
  is_admin() AND user_id IN (
    SELECT id FROM profiles WHERE company_id = get_current_user_company_id()
  )
);

-- 更新企业表RLS策略
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Admins can manage their company" ON companies;

CREATE POLICY "Users can view their company" ON companies FOR SELECT USING (
  id = get_current_user_company_id()
);

CREATE POLICY "Admins can manage their company" ON companies FOR ALL USING (
  is_admin() AND id = get_current_user_company_id()
);
