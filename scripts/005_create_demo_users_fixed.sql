-- Create demo users with proper email format and auth integration
-- Insert demo company first
INSERT INTO companies (id, name, description) 
VALUES (
  'demo-company-id',
  'Demo Company',
  'Demonstration company for AI Workspace'
) ON CONFLICT (id) DO NOTHING;

-- Create auth users first (this will trigger the profile creation via trigger)
-- Admin user
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

-- Regular user
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

-- Update profiles with correct roles and company
UPDATE profiles 
SET 
  username = 'admin',
  display_name = 'Administrator',
  role = 'admin',
  company_id = 'demo-company-id'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@company.local');

UPDATE profiles 
SET 
  username = 'user',
  display_name = 'Demo User',
  role = 'user',
  company_id = 'demo-company-id'
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@company.local');
