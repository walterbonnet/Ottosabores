import { supabase, isSupabaseConfigured } from '../supabase/client';

export const favoritesRepository = {
  async getFavorites(userId: string): Promise<string[]> {
    if (!isSupabaseConfigured || !supabase || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_code')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data.map((f) => f.recipe_code);
    } catch (err) {
      return [];
    }
  },

  async addFavorite(userId: string, recipeCode: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !userId) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, recipe_code: recipeCode });

      return !error;
    } catch (err) {
      return false;
    }
  },

  async removeFavorite(userId: string, recipeCode: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !userId) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_code', recipeCode);

      return !error;
    } catch (err) {
      return false;
    }
  },
};
