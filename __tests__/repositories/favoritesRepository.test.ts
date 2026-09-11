import { favoritesRepository } from '../../src/services/repositories/favoritesRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('favoritesRepository Reliability Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches user recipe favorites for given userId', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValueOnce({
      data: [{ recipe_code: 'r1' }, { recipe_code: 'r2' }],
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    const favorites = await favoritesRepository.getFavorites('usr_123');
    expect(favorites).toEqual(['r1', 'r2']);
  });

  it('returns empty array when user has no favorites recorded', async () => {
    (supabase!.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
    });

    const favorites = await favoritesRepository.getFavorites('usr_new');
    expect(favorites).toEqual([]);
  });

  it('handles backend failure gracefully and returns empty array without throwing', async () => {
    (supabase!.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockRejectedValueOnce(new Error('Network offline')),
    });

    const favorites = await favoritesRepository.getFavorites('usr_123');
    expect(favorites).toEqual([]);
  });
});
