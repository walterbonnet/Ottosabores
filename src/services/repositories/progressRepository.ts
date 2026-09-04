import { supabase, isSupabaseConfigured } from '../supabase/client';
import { RecipeProgress } from '../GlobalStateContext';

export const progressRepository = {
  async getRecipeProgress(userId: string): Promise<{ [recipeCode: string]: RecipeProgress }> {
    if (!isSupabaseConfigured || !supabase || !userId) return {};

    try {
      const { data, error } = await supabase
        .from('recipe_progress')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) return {};

      const result: { [recipeCode: string]: RecipeProgress } = {};
      data.forEach((row) => {
        result[row.recipe_code] = {
          completedIngredients: row.completed_ingredients || [],
          completedSteps: row.completed_steps || [],
          lastStepIndex: row.last_step_index || 0,
          lastUpdated: new Date(row.updated_at).getTime(),
        };
      });

      return result;
    } catch (err) {
      return {};
    }
  },

  async saveProgress(
    userId: string,
    recipeCode: string,
    progress: RecipeProgress
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !userId) return false;

    try {
      const { error } = await supabase
        .from('recipe_progress')
        .upsert({
          user_id: userId,
          recipe_code: recipeCode,
          completed_ingredients: progress.completedIngredients,
          completed_steps: progress.completedSteps,
          last_step_index: progress.lastStepIndex,
          updated_at: new Date(progress.lastUpdated).toISOString(),
        }, { onConflict: 'user_id, recipe_code' });

      return !error;
    } catch (err) {
      return false;
    }
  },
};
