-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 09: Storage Buckets & File Upload RLS Audit
-- ====================================================================

BEGIN;

-- Inspect active storage policies
SELECT 
    policyname, 
    cmd, 
    roles, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Audit policy rules:
-- 1. "Users can upload their own profile avatar" WITH CHECK:
--    qual/check: (bucket_id = 'profiles' AND auth.role() = 'authenticated')
--    FINDING: Lacks path isolation constraint like `(storage.foldername(name))[1] = auth.uid()::text`.
--    RISK: Any authenticated user can upload or overwrite files at arbitrary paths inside 'profiles' bucket.

-- 2. "Editors and admins can upload content images":
--    qual/check: (bucket_id IN ('recipes', 'festivals', 'multimedia', 'curiosities') AND public.is_editor())

ROLLBACK;
