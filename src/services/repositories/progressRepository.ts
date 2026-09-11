import { supabase, isSupabaseConfigured } from '../supabase/client';
import { RecipeProgress } from '../GlobalStateContext';
import { Result, createSuccessResult, createErrorResult } from '../errors/AppError';

export const progressRepository = {
  async getRecipeProgressResult(userId: string): Promise<Result<{ [recipeCode: string]: RecipeProgress }>> {
    if (!isSupabaseConfigured || !supabase || !userId) return createSuccessResult({}, true);

    try {
      const { data, error } = await supabase
        .from('recipe_progress')
        .select('recipe_code, completed_ingredients, completed_steps, last_step_index, updated_at')
        .eq('user_id', userId);

      if (error) {
        return createErrorResult('SERVER_ERROR', error.message, true, error);
      }

      if (!data) return createSuccessResult({});

      const result: { [recipeCode: string]: RecipeProgress } = {};
      data.forEach((row) => {
        result[row.recipe_code] = {
          completedIngredients: row.completed_ingredients || [],
          completedSteps: row.completed_steps || [],
          lastStepIndex: row.last_step_index || 0,
          lastUpdated: new Date(row.updated_at).getTime(),
        };
      });

      return createSuccessResult(result);
    } catch (err) {
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async getRecipeProgress(userId: string): Promise<{ [recipeCode: string]: RecipeProgress }> {
    const res = await this.getRecipeProgressResult(userId);
    return res.ok ? res.data : {};
  },

  async saveProgressResult(
    userId: string,
    recipeCode: string,
    progress: RecipeProgress
  ): Promise<Result<boolean>> {
    if (!isSupabaseConfigured || !supabase || !userId) return createSuccessResult(false, true);

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

      if (error) return createErrorResult('SERVER_ERROR', error.message, true, error);
      return createSuccessResult(true);
    } catch (err) {
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async saveProgress(
    userId: string,
    recipeCode: string,
    progress: RecipeProgress
  ): Promise<boolean> {
    const res = await this.saveProgressResult(userId, recipeCode, progress);
    return res.ok && res.data;
  },
};

