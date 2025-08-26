-- 创建默认公司，确保用户有公司可以分配
INSERT INTO public.companies (id, name, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '演示公司',
  '这是一个演示公司，用于测试系统功能',
  now(),
  now()
) ON CONFLICT DO NOTHING;
