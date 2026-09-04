-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 05: Favorites Table RLS Audit
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

-- Populate initial favorite for USER_A
INSERT INTO public.favorites (user_id, recipe_code) VALUES ('11111111-1111-1111-1111-111111111111', 'r1');

-- Context: Authenticated USER_A
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- 1. SELECT own favorites (Should succeed)
SELECT * FROM public.favorites WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- 2. INSERT own favorite (Should succeed)
INSERT INTO public.favorites (user_id, recipe_code) VALUES ('11111111-1111-1111-1111-111111111111', 'r2');

-- 3. INSERT favorite for USER_B (Should fail)
INSERT INTO public.favorites (user_id, recipe_code) VALUES ('22222222-2222-2222-2222-222222222222', 'r3');

-- 4. DELETE own favorite (Should succeed)
DELETE FROM public.favorites WHERE user_id = '11111111-1111-1111-1111-111111111111' AND recipe_code = 'r1';

ROLLBACK;
