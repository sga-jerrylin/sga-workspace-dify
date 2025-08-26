-- 创建正确的认证用户和档案
-- 首先删除可能存在的旧数据
DELETE FROM auth.users WHERE email LIKE '%@temp.local';
DELETE FROM public.profiles WHERE username IN ('admin', 'user');

-- 创建公司
INSERT INTO public.companies (id, name, description) 
VALUES (
  'c1234567-1234-1234-1234-123456789012',
  '演示公司',
  '这是一个演示公司'
) ON CONFLICT (id) DO NOTHING;

-- 创建管理员用户
DO $$
DECLARE
    admin_user_id uuid := 'a1234567-1234-1234-1234-123456789012';
    user_user_id uuid := 'u1234567-1234-1234-1234-123456789012';
BEGIN
    -- 创建管理员认证用户
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
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        admin_user_id,
        'authenticated',
        'authenticated',
        admin_user_id || '@temp.local',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        FALSE,
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 创建普通用户认证用户
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
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_user_id,
        'authenticated',
        'authenticated',
        user_user_id || '@temp.local',
        crypt('user123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        FALSE,
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 创建管理员档案
    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        role,
        company_id
    ) VALUES (
        admin_user_id,
        'admin',
        '系统管理员',
        'admin',
        'c1234567-1234-1234-1234-123456789012'
    ) ON CONFLICT (id) DO NOTHING;

    -- 创建普通用户档案
    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        role,
        company_id
    ) VALUES (
        user_user_id,
        'user',
        '普通用户',
        'user',
        'c1234567-1234-1234-1234-123456789012'
    ) ON CONFLICT (id) DO NOTHING;
END $$;
