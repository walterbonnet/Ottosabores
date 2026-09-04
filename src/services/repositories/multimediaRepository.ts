import { supabase, isSupabaseConfigured } from '../supabase/client';
import { MULTIMEDIA_ITEMS } from '../mockData';
import { MultimediaItem } from '../../types';

export const multimediaRepository = {
  async getAll(): Promise<MultimediaItem[]> {
    if (!isSupabaseConfigured || !supabase) {
      return MULTIMEDIA_ITEMS;
    }

    try {
      const { data, error } = await supabase
        .from('multimedia')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        return MULTIMEDIA_ITEMS;
      }

      return data.map((row) => ({
        id: row.item_code || row.id,
        title: row.title,
        artist: row.artist,
        duration: row.duration,
        type: row.type as any,
        image: row.image_url,
        audioUrl: row.audio_url || undefined,
        festivalRelacionado: row.related_festival_code || undefined,
      }));
    } catch (err) {
      return MULTIMEDIA_ITEMS;
    }
  },
};
