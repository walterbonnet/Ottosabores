import { supabase, isSupabaseConfigured } from '../supabase/client';
import { FESTIVALS } from '../mockData';
import { Festival } from '../../types';

export const festivalsRepository = {
  async getAll(): Promise<Festival[]> {
    if (!isSupabaseConfigured || !supabase) {
      return FESTIVALS;
    }

    try {
      const { data, error } = await supabase
        .from('festivals')
        .select('*, festival_media(*)')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        return FESTIVALS;
      }

      return data.map((row) => {
        const mockMatch = FESTIVALS.find(f => f.id === row.festival_code || f.id === row.id);
        const mediaUrls = (row.festival_media || [])
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((m: any) => m.url);

        return {
          id: row.festival_code || row.id,
          nombre: row.name,
          localidad: row.location,
          ubicación: mockMatch?.ubicación || row.location,
          fecha: row.date_display,
          historia: row.history,
          productoDestacado: row.featured_product,
          descripcionCorta: mockMatch?.descripcionCorta || row.history.slice(0, 100),
          categoría: mockMatch?.categoría || row.gastronomic_route,
          rutaGastronomica: row.gastronomic_route as any,
          recetaRelacionada: row.related_recipe_code || undefined,
          galeria: mediaUrls.length > 0 ? mediaUrls : (mockMatch?.galeria || []),
          video: row.video_url || mockMatch?.video || '',
          latitud: mockMatch?.latitud,
          longitud: mockMatch?.longitud,
        };
      });
    } catch (err) {
      return FESTIVALS;
    }
  },

  async getById(id: string): Promise<Festival | null> {
    const mockFound = FESTIVALS.find((f) => f.id === id);
    if (!isSupabaseConfigured || !supabase) {
      return mockFound || null;
    }

    try {
      const { data, error } = await supabase
        .from('festivals')
        .select('*, festival_media(*)')
        .or(`festival_code.eq.${id},id.eq.${id}`)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        return mockFound || null;
      }

      const mediaUrls = (data.festival_media || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((m: any) => m.url);

      return {
        id: data.festival_code || data.id,
        nombre: data.name,
        localidad: data.location,
        ubicación: mockFound?.ubicación || data.location,
        fecha: data.date_display,
        historia: data.history,
        productoDestacado: data.featured_product,
        descripcionCorta: mockFound?.descripcionCorta || data.history.slice(0, 100),
        categoría: mockFound?.categoría || data.gastronomic_route,
        rutaGastronomica: data.gastronomic_route as any,
        recetaRelacionada: data.related_recipe_code || undefined,
        galeria: mediaUrls.length > 0 ? mediaUrls : (mockFound?.galeria || []),
        video: data.video_url || mockFound?.video || '',
        latitud: mockFound?.latitud,
        longitud: mockFound?.longitud,
      };
    } catch (err) {
      return mockFound || null;
    }
  },
};
