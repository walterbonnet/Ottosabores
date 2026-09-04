-- ====================================================================
-- Sabores 4.0: Row Level Security (RLS) & RBAC Security Policies
-- Migration ID: 20260904000002_rls_policies
-- Description: Enables RLS across all 25 tables and sets access rules
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festival_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multimedia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curiosities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_location_festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewed_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.played_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.read_curiosities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Helper Functions
CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('editor', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------
-- 1. PUBLIC CONTENT POLICIES (Read published content only)
-- --------------------------------------------------------------------
CREATE POLICY "Public users can view published recipes" 
ON public.recipes FOR SELECT 
USING (is_published = true OR public.is_editor());

CREATE POLICY "Public users can view recipe categories" 
ON public.recipe_categories FOR SELECT 
USING (true);

CREATE POLICY "Public users can view ingredients" 
ON public.ingredients FOR SELECT 
USING (true);

CREATE POLICY "Public users can view recipe ingredients" 
ON public.recipe_ingredients FOR SELECT 
USING (true);

CREATE POLICY "Public users can view recipe steps" 
ON public.recipe_steps FOR SELECT 
USING (true);

CREATE POLICY "Public users can view published festivals" 
ON public.festivals FOR SELECT 
USING (is_published = true OR public.is_editor());

CREATE POLICY "Public users can view festival categories" 
ON public.festival_categories FOR SELECT 
USING (true);

CREATE POLICY "Public users can view festival recipes" 
ON public.festival_recipes FOR SELECT 
USING (true);

CREATE POLICY "Public users can view festival media" 
ON public.festival_media FOR SELECT 
USING (true);

CREATE POLICY "Public users can view published multimedia" 
ON public.multimedia FOR SELECT 
USING (is_published = true OR public.is_editor());

CREATE POLICY "Public users can view published curiosities" 
ON public.curiosities FOR SELECT 
USING (is_published = true OR public.is_editor());

CREATE POLICY "Public users can view map locations" 
ON public.map_locations FOR SELECT 
USING (true);

CREATE POLICY "Public users can view map location festivals" 
ON public.map_location_festivals FOR SELECT 
USING (true);

CREATE POLICY "Public users can view published trivia questions" 
ON public.trivia_questions FOR SELECT 
USING (is_published = true OR public.is_editor());

CREATE POLICY "Public users can view trivia answers" 
ON public.trivia_answers FOR SELECT 
USING (true);

-- Secure Public View for Trivia Questions (Hides correct_answer_idx from client queries)
CREATE OR REPLACE VIEW public.client_trivia_questions AS
SELECT 
    id,
    question_code,
    difficulty,
    question,
    explanation,
    image_url,
    is_published,
    created_at
FROM public.trivia_questions
WHERE is_published = true;

-- --------------------------------------------------------------------
-- 2. PERSONAL USER DATA POLICIES (auth.uid() validation)
-- --------------------------------------------------------------------
-- Profiles
CREATE POLICY "Users can view all public profiles" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Favorites
CREATE POLICY "Users can manage their own favorites" 
ON public.favorites FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Recipe Progress
CREATE POLICY "Users can manage their own recipe progress" 
ON public.recipe_progress FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Recently Viewed
CREATE POLICY "Users can manage their own recently viewed items" 
ON public.recently_viewed FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Trivia History
CREATE POLICY "Users can manage their own trivia history" 
ON public.trivia_history FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Viewed Hotspots
CREATE POLICY "Users can manage their own viewed hotspots" 
ON public.viewed_hotspots FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Played Audios
CREATE POLICY "Users can manage their own played audios" 
ON public.played_audios FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Read Curiosities
CREATE POLICY "Users can manage their own read curiosities" 
ON public.read_curiosities FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- User Preferences
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------------------
-- 3. ADMINISTRATIVE WRITES (Editors & Admins Only)
-- --------------------------------------------------------------------
CREATE POLICY "Editors and admins can modify recipes" 
ON public.recipes FOR ALL 
USING (public.is_editor()) 
WITH CHECK (public.is_editor());

CREATE POLICY "Editors and admins can modify festivals" 
ON public.festivals FOR ALL 
USING (public.is_editor()) 
WITH CHECK (public.is_editor());

CREATE POLICY "Editors and admins can modify multimedia" 
ON public.multimedia FOR ALL 
USING (public.is_editor()) 
WITH CHECK (public.is_editor());

CREATE POLICY "Editors and admins can modify curiosities" 
ON public.curiosities FOR ALL 
USING (public.is_editor()) 
WITH CHECK (public.is_editor());

CREATE POLICY "Editors and admins can modify trivia" 
ON public.trivia_questions FOR ALL 
USING (public.is_editor()) 
WITH CHECK (public.is_editor());

-- Audit logs policy (Only admins can view audit logs)
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (public.is_admin());
