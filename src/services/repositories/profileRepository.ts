import { supabase, isSupabaseConfigured } from '../supabase/client';
import { DbProfile } from '../supabase/types';
import { Logger } from '../logger';
import { Result, createSuccessResult, createErrorResult } from '../errors/AppError';

export interface UpdateProfileDto {
  display_name?: string;
  avatar_url?: string;
}

export const profileRepository = {
  async getProfileResult(userId: string): Promise<Result<DbProfile | null>> {
    if (!isSupabaseConfigured || !supabase || !userId) return createSuccessResult(null, true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url, role, xp, level_title, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createSuccessResult(null);
        }
        return createErrorResult('SERVER_ERROR', error.message, true, error);
      }
      return createSuccessResult(data as DbProfile);
    } catch (err) {
      Logger.warn('profileRepository.getProfile error:', err);
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async getProfile(userId: string): Promise<DbProfile | null> {
    const res = await this.getProfileResult(userId);
    return res.ok ? res.data : null;
  },

  async updateProfileResult(userId: string, updates: UpdateProfileDto): Promise<Result<boolean>> {
    if (!isSupabaseConfigured || !supabase || !userId) return createSuccessResult(false, true);

    const sanitizedUpdates: UpdateProfileDto = {};
    if (typeof updates.display_name === 'string') {
      sanitizedUpdates.display_name = updates.display_name;
    }
    if (typeof updates.avatar_url === 'string') {
      sanitizedUpdates.avatar_url = updates.avatar_url;
    }

    if (Object.keys(sanitizedUpdates).length === 0) return createSuccessResult(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', userId);

      if (error) return createErrorResult('SERVER_ERROR', error.message, true, error);
      return createSuccessResult(true);
    } catch (err) {
      Logger.warn('profileRepository.updateProfile error:', err);
      return createErrorResult('NETWORK_ERROR', err instanceof Error ? err.message : String(err), true, err);
    }
  },

  async updateProfile(userId: string, updates: UpdateProfileDto): Promise<boolean> {
    const res = await this.updateProfileResult(userId, updates);
    return res.ok && res.data;
  },

  async updateXP(userId: string, addedXP: number, _newLevelTitle?: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase || !userId || addedXP <= 0) return false;

    try {
      const { data, error } = await supabase.rpc('award_user_xp', {
        p_xp_to_add: addedXP,
      });

      if (error || !data || !data.success) {
        Logger.warn('award_user_xp RPC failed:', error);
        return false;
      }

      return true;
    } catch (err) {
      Logger.warn('updateXP exception:', err);
      return false;
    }
  },
};

