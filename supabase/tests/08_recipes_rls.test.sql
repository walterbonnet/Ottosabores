-- ====================================================================
-- Sabores 4.0 Security Test Suite
-- Test 08: Content Tables RLS & Publication Rules Audit
-- ====================================================================

BEGIN;

INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local'),
  ('33333333-3333-3333-3333-333333333333', 'editor@sabores.local')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@sabores.local', 'User A', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'editor@sabores.local', 'Editor User', 'editor')
ON CONFLICT (id) DO NOTHING;

-- Insert published and unpublished draft recipes
INSERT INTO public.recipes (id, recipe_code, title, category_name, story, duration_display, is_published) VALUES
  ('10000000-0000-0000-0000-000000000001', 'r_pub', 'Receta Publicada', 'Sabores Guaraníes', 'Historia...', '30 min', true),
  ('10000000-0000-0000-0000-000000000002', 'r_draft', 'Receta Borrador', 'Sabores Guaraníes', 'Borrador...', '30 min', false)
ON CONFLICT (id) DO NOTHING;

-- Context 1: Authenticated Normal User A
SET LOCAL request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- 1. SELECT published recipe (Should return 1 row)
SELECT id, title FROM public.recipes WHERE recipe_code = 'r_pub';

-- 2. SELECT draft recipe (Should return 0 rows for normal user)
SELECT id, title FROM public.recipes WHERE recipe_code = 'r_draft';

-- 3. INSERT new recipe (Should fail for normal user)
INSERT INTO public.recipes (title, category_name, story, duration_display, is_published) 
VALUES ('Fake Recipe', 'Sabores Guaraníes', 'Story...', '10 min', true);

-- 4. UPDATE is_published status on existing recipe (Should fail for normal user)
UPDATE public.recipes SET is_published = false WHERE recipe_code = 'r_pub';

-- Context 2: Editor User
SET LOCAL request.jwt.claims = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';

-- 5. SELECT draft recipe as Editor (Should return 1 row)
SELECT id, title FROM public.recipes WHERE recipe_code = 'r_draft';

-- 6. UPDATE draft recipe to published as Editor (Should succeed)
UPDATE public.recipes SET is_published = true WHERE recipe_code = 'r_draft';

ROLLBACK;
