import { supabase, isSupabaseConfigured } from '../supabase/client';
import { DbProfile } from '../supabase/types';

export interface UpdateProfileDto {
  display_name?: string;
  avatar_url?: string;
}

export const profileRepository = {
  async getProfile(userId: string): Promise<DbProfile | null> {
    if (!isSupabaseConfigured || !supabase || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      return data as DbProfile;
    } catch (err) {
      return null;
    }
  },

  async updateProfile(userId: string, updates: UpdateProfileDto): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !userId) return false;

    // Explicit DTO whitelist filtering - ONLY display_name and avatar_url permitted
    const sanitizedUpdates: UpdateProfileDto = {};
    if (typeof updates.display_name === 'string') {
      sanitizedUpdates.display_name = updates.display_name;
    }
    if (typeof updates.avatar_url === 'string') {
      sanitizedUpdates.avatar_url = updates.avatar_url;
    }

    if (Object.keys(sanitizedUpdates).length === 0) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', userId);

      return !error;
    } catch (err) {
      return false;
    }
  },

  async updateXP(userId: string, addedXP: number, _newLevelTitle?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !userId || addedXP <= 0) return false;

    try {
      // Server-Side Awarding via RPC (derives identity from auth.uid(), calculates level server-side)
      const { data, error } = await supabase.rpc('award_user_xp', {
        p_xp_to_add: addedXP,
      });

      if (error || !data || !data.success) {
        console.warn('award_user_xp RPC failed:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.warn('updateXP exception:', err);
      return false;
    }
  },
};
