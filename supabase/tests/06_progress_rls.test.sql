-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 06: Recipe Progress & State Tables RLS Audit
-- ====================================================================

BEGIN;

INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local', 'User B', 'user')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.recipe_progress (user_id, recipe_code, completed_steps) VALUES 
  ('22222222-2222-2222-2222-222222222222', 'r1', '{0,1,2}');

-- Context: Authenticated USER_A
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- 1. INSERT own progress (Should succeed)
INSERT INTO public.recipe_progress (user_id, recipe_code, completed_steps) 
VALUES ('11111111-1111-1111-1111-111111111111', 'r1', '{0}');

-- 2. UPDATE own progress (Should succeed)
UPDATE public.recipe_progress 
SET completed_steps = '{0,1}' 
WHERE user_id = '11111111-1111-1111-1111-111111111111' AND recipe_code = 'r1';

-- 3. UPDATE USER_B progress (Should fail / 0 rows affected)
UPDATE public.recipe_progress 
SET completed_steps = '{}' 
WHERE user_id = '22222222-2222-2222-2222-222222222222';

ROLLBACK;
