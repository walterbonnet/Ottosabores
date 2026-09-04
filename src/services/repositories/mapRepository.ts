import { DepartmentHotspot } from '../../types';
import { MAP_HOTSPOTS } from '../mockData';
import { supabase, isSupabaseConfigured } from '../supabase/client';

export const mapRepository = {
  async getAll(): Promise<DepartmentHotspot[]> {
    if (!isSupabaseConfigured || !supabase) {
      return MAP_HOTSPOTS;
    }

    try {
      const { data, error } = await supabase
        .from('map_locations')
        .select('*');

      if (error || !data || data.length === 0) {
        return MAP_HOTSPOTS;
      }

      // Map Supabase DB structure to DepartmentHotspot interface
      return data.map((loc: any, idx: number) => {
        const fallback = MAP_HOTSPOTS[idx] || MAP_HOTSPOTS[0];
        return {
          id: loc.location_code || loc.id,
          name: loc.name || fallback.name,
          localDishes: fallback.localDishes,
          localIngredients: fallback.localIngredients,
          description: loc.description || fallback.description,
          x: fallback.x,
          y: fallback.y,
          festivalesEnZona: fallback.festivalesEnZona,
        };
      });
    } catch (e) {
      console.warn('mapRepository.getAll error, falling back to mock:', e);
      return MAP_HOTSPOTS;
    }
  },
};
