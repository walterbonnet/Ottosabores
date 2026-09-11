import { profileRepository } from '../../src/services/repositories/profileRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('profileRepository Reliability & DTO Whitelist Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches profile successfully via getProfileResult', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValueOnce({
      data: {
        id: 'usr_abc',
        email: 'user@test.com',
        display_name: 'Taragüí Cook',
        avatar_url: 'https://img.com/avatar.jpg',
        role: 'user',
        xp: 150,
        level_title: 'Gran Cocinero',
        created_at: '2026-01-01',
        updated_at: '2026-09-10',
      },
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const res = await profileRepository.getProfileResult('usr_abc');

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data?.display_name).toBe('Taragüí Cook');
      expect(res.data?.xp).toBe(150);
    }
  });

  it('returns ok: true with null when profile is not found (PGRST116)', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'No rows returned' },
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const res = await profileRepository.getProfileResult('usr_new');

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data).toBeNull();
    }
  });

  it('returns ok: false with AppError on network failure', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockRejectedValueOnce(new Error('Network connection timeout'));

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const res = await profileRepository.getProfileResult('usr_abc');

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.type).toBe('NETWORK_ERROR');
    }
  });

  it('sanitizes updates to permit ONLY display_name and avatar_url in updateProfileResult', async () => {
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValueOnce({ error: null });

    (supabase!.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
    });

    const res = await profileRepository.updateProfileResult('usr_abc', {
      display_name: 'Nuevo Nombre',
      avatar_url: 'https://new.url',
      // @ts-ignore - testing malicious property injection
      role: 'admin',
      xp: 99999,
    });

    expect(res.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      display_name: 'Nuevo Nombre',
      avatar_url: 'https://new.url',
    });
  });
});
