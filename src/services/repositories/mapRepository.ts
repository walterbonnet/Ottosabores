import { DepartmentHotspot, DepartmentHotspotRow } from '../../types';
import { MAP_HOTSPOTS } from '../mockData';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { Logger } from '../logger';

export const mapRepository = {
  async getAll(): Promise<DepartmentHotspot[]> {
    if (!isSupabaseConfigured || !supabase) {
      return MAP_HOTSPOTS;
    }

    try {
      const { data, error } = await supabase
        .from('map_locations')
        .select('id, location_code, name, description');

      if (error || !data || data.length === 0) {
        Logger.warn('mapRepository.getAll failed or empty, using mock:', error);
        return MAP_HOTSPOTS;
      }

      // Map Supabase DB structure to DepartmentHotspot interface
      return (data as DepartmentHotspotRow[]).map((loc, idx) => {
        const fallback = MAP_HOTSPOTS[idx] || MAP_HOTSPOTS[0];
        return {
          id: loc.id || fallback.id,
          name: loc.name || fallback.name,
          localDishes: loc.dishes || fallback.localDishes,
          localIngredients: loc.ingredients || fallback.localIngredients,
          description: loc.description || fallback.description,
          x: loc.grid_x ?? fallback.x,
          y: loc.grid_y ?? fallback.y,
          festivalesEnZona: loc.festivals || fallback.festivalesEnZona,
        };
      });
    } catch (e) {
      Logger.warn('mapRepository.getAll error, falling back to mock:', e);
      return MAP_HOTSPOTS;
    }
  },
};
