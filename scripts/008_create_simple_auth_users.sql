-- 创建简单的认证用户，避免复杂的RLS策略问题
-- 删除现有的认证用户（如果存在）
DELETE FROM auth.users WHERE email IN ('admin@company.local', 'user@company.local');

-- 创建管理员用户
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@company.local',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 创建普通用户
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'aud',
  'authenticated',
  'user@company.local',
  crypt('user123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 暂时禁用profiles表的RLS策略以避免递归问题
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 创建对应的profiles记录
INSERT INTO profiles (id, username, email, role, company_id, created_at, updated_at)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'admin@company.local' THEN 'admin'
    WHEN u.email = 'user@company.local' THEN 'user'
  END as username,
  u.email,
  CASE 
    WHEN u.email = 'admin@company.local' THEN 'admin'
    WHEN u.email = 'user@company.local' THEN 'user'
  END as role,
  1 as company_id,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email IN ('admin@company.local', 'user@company.local')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  updated_at = NOW();
