import { supabase, isSupabaseConfigured } from '../supabase/client';
import { DbProfile } from '../supabase/types';

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

  async updateXP(userId: string, addedXP: number, newLevelTitle?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !userId) return false;

    try {
      const current = await this.getProfile(userId);
      const newXP = (current?.xp || 0) + addedXP;
      const updates: any = { xp: newXP, updated_at: new Date().toISOString() };
      if (newLevelTitle) updates.level_title = newLevelTitle;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      return !error;
    } catch (err) {
      return false;
    }
  },
};
