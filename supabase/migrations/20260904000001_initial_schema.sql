-- ====================================================================
-- Sabores 4.0: Initial Database Schema Migration
-- Migration ID: 20260904000001_initial_schema
-- Description: Creates 25 normalized PostgreSQL tables for content, user state, and RBAC
-- ====================================================================

-- 1. PROFILES & ROLES
CREATE TYPE user_role AS ENUM ('user', 'editor', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT DEFAULT 'Viajero Culinario',
    avatar_url TEXT,
    role user_role DEFAULT 'user'::user_role NOT NULL,
    xp INTEGER DEFAULT 0 NOT NULL,
    level_title TEXT DEFAULT 'Cocinero Novato 🌾' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_role ON public.profiles(role);

-- 2. RECIPE CATEGORIES
CREATE TABLE IF NOT EXISTS public.recipe_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. RECIPES
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_code TEXT UNIQUE, -- e.g. 'r1', 'r2' for mock parity
    title TEXT NOT NULL,
    category_id UUID REFERENCES public.recipe_categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    story TEXT NOT NULL,
    duration_display TEXT NOT NULL,
    duration_min INTEGER DEFAULT 30 NOT NULL,
    difficulty TEXT DEFAULT 'Fácil' NOT NULL,
    video_url TEXT,
    audio_track_id TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_recipes_published ON public.recipes(is_published);
CREATE INDEX idx_recipes_category ON public.recipes(category_id);

-- 4. INGREDIENTS
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    is_gluten_free BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. RECIPE INGREDIENTS (Junction table)
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    ingredient_name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX idx_recipe_ingredients_recipe ON public.recipe_ingredients(recipe_id);

-- 6. RECIPE STEPS
CREATE TABLE IF NOT EXISTS public.recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    step_number INTEGER NOT NULL,
    instruction_text TEXT NOT NULL,
    grandma_tip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(recipe_id, step_number)
);

CREATE INDEX idx_recipe_steps_recipe ON public.recipe_steps(recipe_id, step_number);

-- 7. FESTIVAL CATEGORIES & ROUTES
CREATE TABLE IF NOT EXISTS public.festival_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

-- 8. FESTIVALS
CREATE TABLE IF NOT EXISTS public.festivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_code TEXT UNIQUE, -- e.g. '1', '2' for mock parity
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    department TEXT NOT NULL,
    date_display TEXT NOT NULL,
    history TEXT NOT NULL,
    featured_product TEXT NOT NULL,
    gastronomic_route TEXT NOT NULL,
    related_recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
    related_recipe_code TEXT,
    video_url TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_festivals_published ON public.festivals(is_published);
CREATE INDEX idx_festivals_route ON public.festivals(gastronomic_route);

-- 9. FESTIVAL RECIPES (Junction)
CREATE TABLE IF NOT EXISTS public.festival_recipes (
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (festival_id, recipe_id)
);

-- 10. FESTIVAL MEDIA (Gallery)
CREATE TABLE IF NOT EXISTS public.festival_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE NOT NULL,
    media_type TEXT DEFAULT 'image' NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX idx_festival_media_festival ON public.festival_media(festival_id);

-- 11. MULTIMEDIA
CREATE TABLE IF NOT EXISTS public.multimedia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code TEXT UNIQUE, -- e.g. 'p1', 'p2'
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    duration TEXT NOT NULL,
    type TEXT NOT NULL, -- 'podcast' | 'recipe_audio' | 'video'
    image_url TEXT NOT NULL,
    audio_url TEXT,
    related_festival_code TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_multimedia_published ON public.multimedia(is_published);

-- 12. CURIOSITIES
CREATE TABLE IF NOT EXISTS public.curiosities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    fact TEXT NOT NULL,
    icon TEXT DEFAULT 'flame' NOT NULL,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. MAP LOCATIONS
CREATE TABLE IF NOT EXISTS public.map_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_code TEXT UNIQUE,
    name TEXT NOT NULL,
    corridor TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL
);

-- 14. MAP LOCATION FESTIVALS
CREATE TABLE IF NOT EXISTS public.map_location_festivals (
    map_location_id UUID REFERENCES public.map_locations(id) ON DELETE CASCADE NOT NULL,
    festival_id UUID REFERENCES public.festivals(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (map_location_id, festival_id)
);

-- 15. TRIVIA QUESTIONS
CREATE TABLE IF NOT EXISTS public.trivia_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_code TEXT UNIQUE, -- e.g. 'q1'
    difficulty TEXT NOT NULL,
    question TEXT NOT NULL,
    explanation TEXT NOT NULL,
    image_url TEXT,
    correct_answer_idx INTEGER NOT NULL, -- PROTECTED: Never sent to client directly
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. TRIVIA ANSWERS (Options)
CREATE TABLE IF NOT EXISTS public.trivia_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.trivia_questions(id) ON DELETE CASCADE NOT NULL,
    option_index INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    UNIQUE(question_id, option_index)
);

-- 17. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipe_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, recipe_code)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- 18. RECIPE PROGRESS
CREATE TABLE IF NOT EXISTS public.recipe_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipe_code TEXT NOT NULL,
    completed_ingredients INTEGER[] DEFAULT '{}' NOT NULL,
    completed_steps INTEGER[] DEFAULT '{}' NOT NULL,
    last_step_index INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, recipe_code)
);

CREATE INDEX idx_recipe_progress_user ON public.recipe_progress(user_id);

-- 19. RECENTLY VIEWED
CREATE TABLE IF NOT EXISTS public.recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'recipe' | 'festival'
    viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_recently_viewed_user ON public.recently_viewed(user_id);

-- 20. TRIVIA HISTORY
CREATE TABLE IF NOT EXISTS public.trivia_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    played_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_trivia_history_user ON public.trivia_history(user_id);

-- 21. VIEWED HOTSPOTS
CREATE TABLE IF NOT EXISTS public.viewed_hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    hotspot_id TEXT NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, hotspot_id)
);

-- 22. PLAYED AUDIOS
CREATE TABLE IF NOT EXISTS public.played_audios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    audio_id TEXT NOT NULL,
    played_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, audio_id)
);

-- 23. READ CURIOSITIES
CREATE TABLE IF NOT EXISTS public.read_curiosities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    curiosity_id TEXT NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, curiosity_id)
);

-- 24. USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_dark_mode BOOLEAN DEFAULT false NOT NULL,
    language TEXT DEFAULT 'es' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 25. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'create' | 'update' | 'delete' | 'publish' | 'unpublish'
    resource_table TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
