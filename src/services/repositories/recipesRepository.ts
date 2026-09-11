import { supabase, isSupabaseConfigured } from '../supabase/client';
import { RECIPES } from '../mockData';
import { Recipe, RecipeIngredientRow, RecipeStepRow } from '../../types';
import { Logger } from '../logger';
import { Result, createSuccessResult, createErrorResult } from '../errors/AppError';

export interface PaginatedRecipes {
  data: Recipe[];
  hasMore: boolean;
  totalCount?: number;
}

export const recipesRepository = {
  async getAll(): Promise<Recipe[]> {
    if (!isSupabaseConfigured || !supabase) {
      return RECIPES;
    }

    try {
      // Explicit projection instead of select('*') to minimize payload and bandwidth
      const { data, error } = await supabase
        .from('recipes')
        .select('id, recipe_code, title, category_name, story, duration_display, difficulty, video_url, audio_track_id')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        Logger.warn('Supabase fetch failed or empty, falling back to mock recipes:', error);
        return RECIPES;
      }

      // Map Supabase rows to App Recipe Model
      return data.map((row) => ({
        id: row.recipe_code || row.id,
        nombre: row.title,
        categoría: row.category_name as Recipe['categoría'],
        historia: row.story,
        ingredientes: [], // Steps & ingredients fetched on detail or fallback
        preparación: [],
        duración: row.duration_display,
        dificultad: row.difficulty as Recipe['dificultad'],
        video: row.video_url || undefined,
        audioTrackId: row.audio_track_id || undefined,
      }));
    } catch (err) {
      Logger.warn('Repository exception, using mock recipes:', err);
      return RECIPES;
    }
  },

  async getPaginatedResult(
    optionsOrPage: number | { page?: number; pageSize?: number; searchQuery?: string; category?: string; favoriteIds?: string[] } = 0,
    pageSizeParam: number = 20
  ): Promise<Result<PaginatedRecipes>> {
    let page = 0;
    let pageSize = pageSizeParam;
    let searchQuery = '';
    let category = 'Todos';
    let favoriteIds: string[] = [];

    if (typeof optionsOrPage === 'number') {
      page = optionsOrPage;
    } else if (typeof optionsOrPage === 'object' && optionsOrPage !== null) {
      page = optionsOrPage.page ?? 0;
      pageSize = optionsOrPage.pageSize ?? 20;
      searchQuery = optionsOrPage.searchQuery ?? '';
      category = optionsOrPage.category ?? 'Todos';
      favoriteIds = optionsOrPage.favoriteIds ?? [];
    }

    if (!isSupabaseConfigured || !supabase) {
      let filtered = RECIPES;
      if (category && category !== 'Todos') {
        if (category === 'Favoritos') {
          filtered = filtered.filter((r) => favoriteIds.includes(r.id));
        } else {
          filtered = filtered.filter((r) => r.categoría === category);
        }
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (r) => r.nombre.toLowerCase().includes(q) || r.historia.toLowerCase().includes(q)
        );
      }
      const start = page * pageSize;
      const sliced = filtered.slice(start, start + pageSize);
      return createSuccessResult({ data: sliced, hasMore: start + pageSize < filtered.length, totalCount: filtered.length }, true);
    }

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('recipes')
        .select('id, recipe_code, title, category_name, story, duration_display, difficulty, video_url, audio_track_id', { count: 'exact' })
        .eq('is_published', true);

      if (category && category !== 'Todos') {
        if (category === 'Favoritos') {
          if (favoriteIds.length > 0) {
            query = query.in('recipe_code', favoriteIds);
          } else {
            return createSuccessResult({ data: [], hasMore: false, totalCount: 0 });
          }
        } else {
          query = query.eq('category_name', category);
        }
      }

      if (searchQuery.trim().length > 0) {
        const term = searchQuery.trim();
        query = query.or(`title.ilike.%${term}%,story.ilike.%${term}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: true })
        .range(from, to);

      if (error) {
        Logger.warn('recipesRepository.getPaginatedResult query error:', error);
        return createErrorResult('SERVER_ERROR', error.message, true, error);
      }

      if (!data) {
        return createSuccessResult({ data: [], hasMore: false, totalCount: 0 });
      }

      const mapped: Recipe[] = data.map((row) => ({
        id: row.recipe_code || row.id,
        nombre: row.title,
        categoría: row.category_name as Recipe['categoría'],
        historia: row.story,
        ingredientes: [],
        preparación: [],
        duración: row.duration_display,
        dificultad: row.difficulty as Recipe['dificultad'],
        video: row.video_url || undefined,
        audioTrackId: row.audio_track_id || undefined,
      }));

      const hasMore = count ? from + mapped.length < count : mapped.length === pageSize;
      return createSuccessResult({ data: mapped, hasMore, totalCount: count || mapped.length });
    } catch (err) {
      Logger.warn('getPaginatedResult exception:', err);
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async getPaginated(
    optionsOrPage: number | { page?: number; pageSize?: number; searchQuery?: string; category?: string; favoriteIds?: string[] } = 0,
    pageSizeParam: number = 20
  ): Promise<{ data: Recipe[]; hasMore: boolean }> {
    const res = await this.getPaginatedResult(optionsOrPage, pageSizeParam);
    if (res.ok) {
      return { data: res.data.data, hasMore: res.data.hasMore };
    }
    return { data: [], hasMore: false };
  },


  async getById(id: string): Promise<Recipe | null> {
    const mockFound = RECIPES.find((r) => r.id === id);
    if (!isSupabaseConfigured || !supabase) {
      return mockFound || null;
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, recipe_code, title, category_name, story, duration_display, difficulty, video_url, audio_track_id, recipe_ingredients(ingredient_name, display_order), recipe_steps(instruction_text, step_number)')
        .or(`recipe_code.eq.${id},id.eq.${id}`)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        return mockFound || null;
      }

      const ingredients = ((data.recipe_ingredients as RecipeIngredientRow[]) || [])
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        .map((i) => i.ingredient_name);

      const steps = ((data.recipe_steps as RecipeStepRow[]) || [])
        .sort((a, b) => (a.step_number || 0) - (b.step_number || 0))
        .map((s) => s.instruction_text);

      return {
        id: data.recipe_code || data.id,
        nombre: data.title,
        categoría: data.category_name as Recipe['categoría'],
        historia: data.story,
        ingredientes: ingredients.length > 0 ? ingredients : (mockFound?.ingredientes || []),
        preparación: steps.length > 0 ? steps : (mockFound?.preparación || []),
        duración: data.duration_display,
        dificultad: data.difficulty as Recipe['dificultad'],
        video: data.video_url || undefined,
        audioTrackId: data.audio_track_id || undefined,
      };
    } catch (err) {
      Logger.warn('getById error:', err);
      return mockFound || null;
    }
  },
};
