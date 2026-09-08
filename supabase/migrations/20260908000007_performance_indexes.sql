-- ====================================================================
-- Sabores 4.0: Performance Composite Indexes Migration
-- Migration ID: 20260908000007_performance_indexes
-- Description: Adds composite indexes on high-frequency lookup tables (favorites, recipe_progress)
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_favorites_user_recipe ON public.favorites(user_id, recipe_code);
CREATE INDEX IF NOT EXISTS idx_recipe_progress_user_recipe ON public.recipe_progress(user_id, recipe_code);
