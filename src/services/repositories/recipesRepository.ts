import { supabase, isSupabaseConfigured } from '../supabase/client';
import { RECIPES } from '../mockData';
import { Recipe } from '../../types';

export const recipesRepository = {
  async getAll(): Promise<Recipe[]> {
    if (!isSupabaseConfigured || !supabase) {
      return RECIPES;
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn('Supabase fetch failed or empty, falling back to mock recipes:', error);
        return RECIPES;
      }

      // Map Supabase rows to App Recipe Model
      return data.map((row) => ({
        id: row.recipe_code || row.id,
        nombre: row.title,
        categoría: row.category_name,
        historia: row.story,
        ingredientes: [], // Steps & ingredients fetched on detail or fallback
        preparación: [],
        duración: row.duration_display,
        dificultad: row.difficulty as any,
        video: row.video_url || undefined,
        audioTrackId: row.audio_track_id || undefined,
      }));
    } catch (err) {
      console.warn('Repository exception, using mock recipes:', err);
      return RECIPES;
    }
  },

  async getById(id: string): Promise<Recipe | null> {
    const mockFound = RECIPES.find((r) => r.id === id);
    if (!isSupabaseConfigured || !supabase) {
      return mockFound || null;
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_ingredients(*), recipe_steps(*)')
        .or(`recipe_code.eq.${id},id.eq.${id}`)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        return mockFound || null;
      }

      const ingredients = (data.recipe_ingredients || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((i: any) => i.ingredient_name);

      const steps = (data.recipe_steps || [])
        .sort((a: any, b: any) => a.step_number - b.step_number)
        .map((s: any) => s.instruction_text);

      return {
        id: data.recipe_code || data.id,
        nombre: data.title,
        categoría: data.category_name,
        historia: data.story,
        ingredientes: ingredients.length > 0 ? ingredients : (mockFound?.ingredientes || []),
        preparación: steps.length > 0 ? steps : (mockFound?.preparación || []),
        duración: data.duration_display,
        dificultad: data.difficulty as any,
        video: data.video_url || undefined,
        audioTrackId: data.audio_track_id || undefined,
      };
    } catch (err) {
      return mockFound || null;
    }
  },
};
