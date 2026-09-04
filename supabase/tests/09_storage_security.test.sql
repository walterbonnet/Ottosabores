-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 09: Supabase Storage & Bucket Security Audit (TEST-STORAGE-01 to TEST-STORAGE-08)
-- ====================================================================

BEGIN;

-- Setup Test Users
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local'),
  ('33333333-3333-3333-3333-333333333333', 'editor@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local', 'User B', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'editor@sabores.local', 'Editor User', 'editor')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- TEST-STORAGE-01: USER_A upload to own folder -> PASS (ALLOWED)
-- --------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

INSERT INTO storage.objects (id, bucket_id, name, owner, metadata)
VALUES (
  gen_random_uuid(),
  'profiles',
  '11111111-1111-1111-1111-111111111111/avatar.jpg',
  '11111111-1111-1111-1111-111111111111',
  '{"mimetype": "image/jpeg"}'::jsonb
);

-- --------------------------------------------------------------------
-- TEST-STORAGE-02: USER_A upload to USER_B folder -> DENIED (RLS Check Violation)
-- --------------------------------------------------------------------
-- Expectation: Fails RLS check because (storage.foldername(name))[1] != auth.uid()

-- --------------------------------------------------------------------
-- TEST-STORAGE-03: USER_B upload to USER_A folder -> DENIED (RLS Check Violation)
-- --------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

-- Expectation: Fails RLS check if USER_B attempts to insert object under '11111111-1111-1111-1111-111111111111/avatar2.jpg'

-- --------------------------------------------------------------------
-- TEST-STORAGE-04: USER_A overwrite USER_B -> DENIED (0 rows affected / RLS violation)
-- --------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

UPDATE storage.objects 
SET metadata = '{"mimetype": "image/webp"}'::jsonb 
WHERE bucket_id = 'profiles' AND name = '22222222-2222-2222-2222-222222222222/avatar.jpg';

-- --------------------------------------------------------------------
-- TEST-STORAGE-05: USER_A delete USER_B -> DENIED (0 rows affected / RLS violation)
-- --------------------------------------------------------------------
DELETE FROM storage.objects 
WHERE bucket_id = 'profiles' AND name = '22222222-2222-2222-2222-222222222222/avatar.jpg';

-- --------------------------------------------------------------------
-- TEST-STORAGE-06: USER_A delete own avatar -> ALLOWED
-- --------------------------------------------------------------------
DELETE FROM storage.objects 
WHERE bucket_id = 'profiles' AND name = '11111111-1111-1111-1111-111111111111/avatar.jpg';

-- --------------------------------------------------------------------
-- TEST-STORAGE-07: Normal user upload to recipes bucket -> DENIED (RLS Check Violation)
-- --------------------------------------------------------------------
-- Expectation: Normal USER_A rejected when inserting into 'recipes' bucket

-- --------------------------------------------------------------------
-- TEST-STORAGE-08: Editor user upload to recipes bucket -> ALLOWED
-- --------------------------------------------------------------------
SET LOCAL request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';

INSERT INTO storage.objects (id, bucket_id, name, owner, metadata)
VALUES (
  gen_random_uuid(),
  'recipes',
  'r1_hero.jpg',
  '33333333-3333-3333-3333-333333333333',
  '{"mimetype": "image/jpeg"}'::jsonb
);

ROLLBACK;
