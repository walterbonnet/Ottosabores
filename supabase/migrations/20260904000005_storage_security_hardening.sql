-- ====================================================================
-- Sabores 4.0: Supabase Storage Security Hardening Migration
-- Migration ID: 20260904000005_storage_security_hardening
-- Description: Enforces user path isolation, MIME validation, and UPDATE/DELETE policies for storage.objects
-- ====================================================================

-- 1. DROP LEGACY PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Users can upload their own profile avatar" ON storage.objects;
DROP POLICY IF EXISTS "Editors and admins can upload content images" ON storage.objects;

-- 2. PROFILES BUCKET: HARDENED INSERT POLICY (Path Isolation & MIME Check)
CREATE POLICY "Users can upload their own profile avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profiles' AND 
  auth.role() = 'authenticated' AND 
  (storage.foldername(name))[1] = auth.uid()::text AND
  (metadata->>'mimetype' = ANY(ARRAY['image/jpeg', 'image/png', 'image/webp']))
);

-- 3. PROFILES BUCKET: HARDENED UPDATE / OVERWRITE POLICY (Path Isolation)
CREATE POLICY "Users can update their own profile avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profiles' AND 
  auth.role() = 'authenticated' AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profiles' AND 
  auth.role() = 'authenticated' AND 
  (storage.foldername(name))[1] = auth.uid()::text AND
  (metadata->>'mimetype' = ANY(ARRAY['image/jpeg', 'image/png', 'image/webp']))
);

-- 4. PROFILES BUCKET: HARDENED DELETE POLICY (Path Isolation)
CREATE POLICY "Users can delete their own profile avatar" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profiles' AND 
  auth.role() = 'authenticated' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. CONTENT BUCKETS: EDITOR / ADMIN MANAGEMENT POLICY
CREATE POLICY "Editors and admins can manage content storage" 
ON storage.objects FOR ALL 
USING (
  bucket_id IN ('recipes', 'festivals', 'multimedia', 'curiosities') AND 
  public.is_editor()
) 
WITH CHECK (
  bucket_id IN ('recipes', 'festivals', 'multimedia', 'curiosities') AND 
  public.is_editor()
);
