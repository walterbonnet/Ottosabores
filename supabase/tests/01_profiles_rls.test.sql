-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 01: Profiles Table RLS & Privilege Escalation Audit
-- ====================================================================

BEGIN;

-- Setup Test Users in auth.users & public.profiles
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role, xp, level_title) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user', 10, 'Cocinero Novato 🌾'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local', 'User B', 'user', 50, 'Cocinero Aficionado 🍳')
ON CONFLICT (id) DO NOTHING;

-- 1. Test SELECT Public Profiles as USER_A
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT id, display_name, role, xp FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222';

-- 2. Test UPDATE Own Profile (Legitimate: display_name)
UPDATE public.profiles 
SET display_name = 'User A Updated' 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- 3. Test UPDATE IDOR: USER_A attempts to update USER_B's profile
UPDATE public.profiles 
SET display_name = 'Hacked by User A' 
WHERE id = '22222222-2222-2222-2222-222222222222';

-- 4. Test Privilege Escalation: USER_A attempts to elevate role to 'admin'
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Check resulting role (Exposes if privilege escalation succeeded)
SELECT id, email, role, xp FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

ROLLBACK;
