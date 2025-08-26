-- Create demo users for testing
-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@company.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "admin"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create regular user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'user@company.local',
  crypt('user123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "user"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create profiles for the demo users
INSERT INTO public.profiles (id, username, role, company_id)
SELECT 
  u.id,
  (u.raw_user_meta_data->>'username')::text,
  CASE 
    WHEN u.email = 'admin@company.local' THEN 'admin'::user_role
    ELSE 'user'::user_role
  END,
  (SELECT id FROM companies LIMIT 1)
FROM auth.users u
WHERE u.email IN ('admin@company.local', 'user@company.local')
ON CONFLICT (id) DO NOTHING;
