import { progressRepository } from '../../src/services/repositories/progressRepository';
import { favoritesRepository } from '../../src/services/repositories/favoritesRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('User Isolation & Data Leakage Prevention Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ensures getRecipeProgress issues user_id filter for User A without leaking User B data', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValueOnce({
      data: [
        {
          recipe_code: 'rec_a',
          completed_ingredients: [0],
          completed_steps: [0],
          last_step_index: 0,
          updated_at: '2026-09-10T12:00:00Z',
        },
      ],
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    const resUserA = await progressRepository.getRecipeProgressResult('user_a_id');

    expect(mockEq).toHaveBeenCalledWith('user_id', 'user_a_id');
    expect(resUserA.ok).toBe(true);
    if (resUserA.ok) {
      expect(Object.keys(resUserA.data)).toEqual(['rec_a']);
    }
  });

  it('ensures getFavorites issues user_id filter for User B without leaking User A favorites', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValueOnce({
      data: [{ recipe_code: 'rec_fav_b' }],
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    const resUserB = await favoritesRepository.getFavoritesResult('user_b_id');

    expect(mockEq).toHaveBeenCalledWith('user_id', 'user_b_id');
    expect(resUserB.ok).toBe(true);
    if (resUserB.ok) {
      expect(resUserB.data).toEqual(['rec_fav_b']);
    }
  });
});
