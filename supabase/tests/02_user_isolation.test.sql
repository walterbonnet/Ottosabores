-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 02: User Isolation Across Personal Tables
-- ====================================================================

BEGIN;

-- Setup Test Users
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local', 'User B', 'user')
ON CONFLICT (id) DO NOTHING;

-- Populate USER_B personal data
INSERT INTO public.favorites (user_id, recipe_code) VALUES ('22222222-2222-2222-2222-222222222222', 'r1');
INSERT INTO public.recipe_progress (user_id, recipe_code, completed_ingredients) VALUES ('22222222-2222-2222-2222-222222222222', 'r1', '{0,1}');
INSERT INTO public.recently_viewed (user_id, item_id, item_type) VALUES ('22222222-2222-2222-2222-222222222222', 'r1', 'recipe');
INSERT INTO public.trivia_history (user_id, score, total) VALUES ('22222222-2222-2222-2222-222222222222', 5, 5);

-- Switch Context to USER_A
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- 1. Attempt SELECT USER_B's favorites
SELECT * FROM public.favorites WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- 2. Attempt INSERT into favorites with user_id = USER_B (Cross-tenant INSERT tampering)
INSERT INTO public.favorites (user_id, recipe_code) VALUES ('22222222-2222-2222-2222-222222222222', 'r2');

-- 3. Attempt UPDATE USER_B's recipe progress
UPDATE public.recipe_progress 
SET completed_ingredients = '{}' 
WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- 4. Attempt DELETE USER_B's trivia history
DELETE FROM public.trivia_history WHERE user_id = '22222222-2222-2222-2222-222222222222';

ROLLBACK;
