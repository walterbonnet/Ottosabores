-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 09: Supabase Storage & Bucket Security Audit
-- ====================================================================

BEGIN;

-- Setup Test Users
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@sabores.local')
ON CONFLICT (id) DO NOTHING;

-- 1. Inspect Bucket Configuration (MIME types, file size limits, public flag)
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
ORDER BY id;

-- 2. Inspect Storage Policies on storage.objects
SELECT 
    policyname, 
    cmd, 
    roles, 
    qual, 
    with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 3. Simulate USER_A inserting object into profiles bucket under USER_B folder
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- Test A: USER_A uploads to profiles/USER_B/avatar.jpg (Audit: Missing folder name check)
INSERT INTO storage.objects (id, bucket_id, name, owner, metadata)
VALUES (
  gen_random_uuid(),
  'profiles',
  'USER_B/avatar.jpg',
  '11111111-1111-1111-1111-111111111111',
  '{"mimetype": "image/jpeg"}'::jsonb
);

-- Test B: USER_A attempts path traversal string in object name 'USER_B/../USER_B/avatar.jpg'
INSERT INTO storage.objects (id, bucket_id, name, owner, metadata)
VALUES (
  gen_random_uuid(),
  'profiles',
  'USER_B/../USER_B/avatar.jpg',
  '11111111-1111-1111-1111-111111111111',
  '{"mimetype": "image/jpeg"}'::jsonb
);

-- Test C: USER_A attempts to upload unapproved MIME type or script
INSERT INTO storage.objects (id, bucket_id, name, owner, metadata)
VALUES (
  gen_random_uuid(),
  'profiles',
  '11111111-1111-1111-1111-111111111111/script.php.png',
  '11111111-1111-1111-1111-111111111111',
  '{"mimetype": "text/html"}'::jsonb
);

-- Test D: USER_A attempts DELETE on USER_B object
DELETE FROM storage.objects 
WHERE bucket_id = 'profiles' AND name = 'USER_B/avatar.jpg';

ROLLBACK;
