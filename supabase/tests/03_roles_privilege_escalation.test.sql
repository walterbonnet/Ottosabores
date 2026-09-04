-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 03: RBAC & Role Privilege Escalation
-- ====================================================================

BEGIN;

-- Setup Test Users with standard role 'user'
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('33333333-3333-3333-3333-333333333333', 'editor@sabores.local'),
  ('44444444-4444-4444-4444-444444444444', 'admin@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'Normal User A', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'editor@sabores.local', 'Content Editor', 'editor'),
  ('44444444-4444-4444-4444-444444444444', 'admin@sabores.local', 'System Admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Context 1: Normal User A attempts to update role to 'editor' or 'admin'
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

UPDATE public.profiles SET role = 'editor' WHERE id = '11111111-1111-1111-1111-111111111111';

-- Check if is_editor() helper now evaluates to true for User A
SELECT public.is_editor();

-- Context 2: Normal User A attempts to update Editor's profile role
UPDATE public.profiles SET role = 'user' WHERE id = '33333333-3333-3333-3333-333333333333';

ROLLBACK;
