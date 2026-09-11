import { supabase, isSupabaseConfigured } from '../supabase/client';
import { Result, createSuccessResult, createErrorResult } from '../errors/AppError';

export const favoritesRepository = {
  async getFavoritesResult(userId: string): Promise<Result<string[]>> {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return createSuccessResult([], true);
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_code')
        .eq('user_id', userId);

      if (error) {
        return createErrorResult('SERVER_ERROR', error.message, true, error);
      }
      if (!data) return createSuccessResult([]);
      return createSuccessResult(data.map((f) => f.recipe_code));
    } catch (err) {
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async getFavorites(userId: string): Promise<string[]> {
    const res = await this.getFavoritesResult(userId);
    return res.ok ? res.data : [];
  },

  async addFavoriteResult(userId: string, recipeCode: string): Promise<Result<boolean>> {
    if (!isSupabaseConfigured || !supabase || !userId) return createSuccessResult(false, true);

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, recipe_code: recipeCode });

      if (error) return createErrorResult('SERVER_ERROR', error.message, true, error);
      return createSuccessResult(true);
    } catch (err) {
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async addFavorite(userId: string, recipeCode: string): Promise<boolean> {
    const res = await this.addFavoriteResult(userId, recipeCode);
    return res.ok && res.data;
  },

  async removeFavoriteResult(userId: string, recipeCode: string): Promise<Result<boolean>> {
    if (!isSupabaseConfigured || !supabase || !userId) return createSuccessResult(false, true);

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_code', recipeCode);

      if (error) return createErrorResult('SERVER_ERROR', error.message, true, error);
      return createSuccessResult(true);
    } catch (err) {
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async removeFavorite(userId: string, recipeCode: string): Promise<boolean> {
    const res = await this.removeFavoriteResult(userId, recipeCode);
    return res.ok && res.data;
  },
};

