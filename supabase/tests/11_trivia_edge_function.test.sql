-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 11: Edge Function & Trivia History Security Audit
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

-- Context 1: Authenticated User A attempting direct SQL INSERT into trivia_history for USER_B
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- 1. Direct INSERT into trivia_history for USER_B (Should fail by RLS)
INSERT INTO public.trivia_history (user_id, score, total) VALUES ('22222222-2222-2222-2222-222222222222', 100, 100);

-- 2. Direct INSERT into trivia_history for self (Allowed by RLS, but score integrity relies on backend validation)
INSERT INTO public.trivia_history (user_id, score, total) VALUES ('11111111-1111-1111-1111-111111111111', 999, 999);

-- 3. Direct UPDATE of trivia_history for USER_B (Should fail by RLS)
UPDATE public.trivia_history SET score = 0 WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- 4. Direct DELETE of trivia_history for USER_B (Should fail by RLS)
DELETE FROM public.trivia_history WHERE user_id = '22222222-2222-2222-2222-222222222222';

ROLLBACK;
