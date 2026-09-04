-- ====================================================================
-- Sabores 4.0: Initial Database Seed File
-- Seed File: supabase/seed/seed.sql
-- Description: Populates Corrientes culinary heritage data into PostgreSQL
-- ====================================================================

-- 1. RECIPE CATEGORIES SEED
INSERT INTO public.recipe_categories (id, name, slug, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Sabores Guaraníes', 'sabores-guaranies', 'Platos tradicionales prehispánicos y jesuitas'),
  ('22222222-2222-2222-2222-222222222222', 'Guisos y Comidas Populares', 'guisos-populares', 'Guisados lentos en ollas de hierro a la leña'),
  ('33333333-3333-3333-3333-333333333333', 'Frutas y Productos Naturales', 'frutas-naturales', 'Frutos de la tierra, mamón, mango y yatay'),
  ('44444444-4444-4444-4444-444444444444', 'Carnes Tradicionales', 'carnes-tradicionales', 'Asados a la estaca, lechón y chicharrón trenzado'),
  ('55555555-5555-5555-5555-555555555555', 'Panificados y Dulces', 'panificados-dulces', 'Chipás, mbejús y tortas tradicionales')
ON CONFLICT (slug) DO NOTHING;

-- 2. RECIPES SEED
INSERT INTO public.recipes (id, recipe_code, title, category_id, category_name, story, duration_display, duration_min, difficulty, video_url, is_published)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'r1', 'Chipá Tradicional', '11111111-1111-1111-1111-111111111111', 'Sabores Guaraníes', 'El chipá es herencia directa de la cultura guaraní y las misiones jesuíticas.', '45 min', 45, 'Fácil', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=85', true),
  ('a2222222-2222-2222-2222-222222222222', 'r2', 'Mbaipy (Polenta Guaraní)', '11111111-1111-1111-1111-111111111111', 'Sabores Guaraníes', 'Densa crema de harina de maíz casera cocida en olla de hierro.', '60 min', 60, 'Media', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=85', true),
  ('a3333333-3333-3333-3333-333333333333', 'r3', 'Guiso de Arroz Riachuelero', '22222222-2222-2222-2222-222222222222', 'Guisos y Comidas Populares', 'Arroz largo fino del litoral sofrito con cebolla y carne a la leña.', '50 min', 50, 'Fácil', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=85', true),
  ('a4444444-4444-4444-4444-444444444444', 'r4', 'Dulce de Mamón en Almíbar', '33333333-3333-3333-3333-333333333333', 'Frutas y Productos Naturales', 'Gajos dorados de mamón verde cocidos en almíbar espeso.', '120 min', 120, 'Media', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop&q=85', true),
  ('a5555555-5555-5555-5555-555555555555', 'r5', 'Cordero Mercedeño a la Estaca', '44444444-4444-4444-4444-444444444444', 'Carnes Tradicionales', 'Cordero criollo asado a fuego de leña de espinillo.', '180 min', 180, 'Difícil', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=85', true)
ON CONFLICT (recipe_code) DO NOTHING;

-- 3. FESTIVALS SEED
INSERT INTO public.festivals (id, festival_code, name, location, department, date_display, history, featured_product, gastronomic_route, video_url, is_published)
VALUES 
  ('f1111111-1111-1111-1111-111111111111', '1', 'Fiesta Provincial del Búfalo', 'Caá Catí', 'General Paz', 'Noviembre', 'Celebración gaucha y ganadera del norte correntino.', 'Carne de Búfalo', 'Carnes Tradicionales', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&auto=format&fit=crop&q=85', true),
  ('f2222222-2222-2222-2222-222222222222', '2', 'Fiesta del Cordero Mercedeño', 'Mercedes', 'Mercedes', 'Octubre', 'Encuentro gastronómico en el corazón del Iberá.', 'Cordero a la Estaca', 'Carnes Tradicionales', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=85', true),
  ('f3333333-3333-3333-3333-333333333333', '3', 'Fiesta Provincial del Chipá', 'Santa Rosa', 'Concepción', 'Enero', 'Homenaje al pan de almidón ancestral.', 'Chipá Tradicional', 'Herencia Guaraní', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=85', true)
ON CONFLICT (festival_code) DO NOTHING;

-- 4. MULTIMEDIA SEED
INSERT INTO public.multimedia (id, item_code, title, artist, duration, type, image_url, audio_url, related_festival_code, is_published)
VALUES 
  ('m1111111-1111-1111-1111-111111111111', 'p1', 'El Secreto del Almidón de Mandioca', 'Abuela Cata de San Cosme', '04:12', 'podcast', 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&auto=format&fit=crop&q=85', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '9', true),
  ('m2222222-2222-2222-2222-222222222222', 'p2', 'El Sonido del Fuego y el Mbaipy', 'Panchi Quevedo (Cocinero de Estero)', '06:45', 'recipe_audio', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=85', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', '7', true)
ON CONFLICT (item_code) DO NOTHING;

-- 5. TRIVIA QUESTIONS SEED
INSERT INTO public.trivia_questions (id, question_code, difficulty, question, explanation, image_url, correct_answer_idx, is_published)
VALUES 
  ('q1111111-1111-1111-1111-111111111111', 'q1', 'Fácil', '¿Cuál es el ingrediente principal, libre de gluten, utilizado para elaborar la masa del Chipá tradicional?', 'El almidón de mandioca es la base del chipá.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=85', 1, true),
  ('q2222222-2222-2222-2222-222222222222', 'q2', 'Fácil', '¿Cómo se le llama a la infusión de yerba mate preparada con agua helada y hierbas medicinales aromáticas?', 'El Tereré es la infusión helada por excelencia.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=85', 2, true)
ON CONFLICT (question_code) DO NOTHING;

INSERT INTO public.trivia_answers (question_id, option_index, option_text)
VALUES 
  ('q1111111-1111-1111-1111-111111111111', 0, 'Harina de trigo'),
  ('q1111111-1111-1111-1111-111111111111', 1, 'Almidón de mandioca'),
  ('q1111111-1111-1111-1111-111111111111', 2, 'Harina de maíz'),
  ('q1111111-1111-1111-1111-111111111111', 3, 'Semolín'),
  ('q2222222-2222-2222-2222-222222222222', 0, 'Mate cocido'),
  ('q2222222-2222-2222-2222-222222222222', 1, 'Chimarrão'),
  ('q2222222-2222-2222-2222-222222222222', 2, 'Tereré'),
  ('q2222222-2222-2222-2222-222222222222', 3, 'Mate dulce')
ON CONFLICT (question_id, option_index) DO NOTHING;

-- 6. CURIOSITIES SEED
INSERT INTO public.curiosities (id, title, fact, icon, is_published)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'El Gofio Litoraleño', 'En Corrientes el gofio es maíz tostado y molido dulce.', 'star', true),
  ('c2222222-2222-2222-2222-222222222222', 'Origen de la Mandioca', 'Los guaraníes consideraban a la mandioca un regalo de los dioses.', 'sunny', true)
ON CONFLICT DO NOTHING;
