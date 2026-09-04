-- ====================================================================
-- Sabores 4.0: Supabase Storage Buckets & Policies
-- Migration ID: 20260904000003_storage_buckets
-- Description: Creates 5 storage buckets with public read policies
-- ====================================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('recipes', 'recipes', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('festivals', 'festivals', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('multimedia', 'multimedia', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp3', 'video/mp4']),
  ('profiles', 'profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('curiosities', 'curiosities', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies
-- Public Read Policies
CREATE POLICY "Public Read Recipes Storage" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'recipes');

CREATE POLICY "Public Read Festivals Storage" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'festivals');

CREATE POLICY "Public Read Multimedia Storage" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'multimedia');

CREATE POLICY "Public Read Profiles Storage" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Public Read Curiosities Storage" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'curiosities');

-- User Upload Policy for Profile Avatars
CREATE POLICY "Users can upload their own profile avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profiles' AND 
  auth.role() = 'authenticated'
);

-- Admin Upload Policies for Content Buckets
CREATE POLICY "Editors and admins can upload content images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id IN ('recipes', 'festivals', 'multimedia', 'curiosities') AND 
  public.is_editor()
);
