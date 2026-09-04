-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 04: Gamification XP & Level Title Integrity Audit
-- ====================================================================

BEGIN;

INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role, xp, level_title) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user', 10, 'Cocinero Novato 🌾')
ON CONFLICT (id) DO NOTHING;

-- Context: Authenticated User A
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- Test 1: Direct SQL UPDATE on xp and level_title
UPDATE public.profiles 
SET xp = 9999999, level_title = 'Gran Maestro Culinario 👑' 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Check if XP update was allowed
SELECT id, display_name, xp, level_title FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

ROLLBACK;
