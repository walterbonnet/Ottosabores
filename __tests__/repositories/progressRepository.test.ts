import { progressRepository } from '../../src/services/repositories/progressRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('progressRepository Reliability & User Isolation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches user recipe progress map for given userId', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValueOnce({
      data: [
        {
          recipe_code: 'r1',
          completed_ingredients: [0, 2],
          completed_steps: [0],
          last_step_index: 1,
          updated_at: '2026-09-10T12:00:00Z',
        },
      ],
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    const progressMap = await progressRepository.getRecipeProgress('usr_123');

    expect(progressMap['r1']).toBeDefined();
    expect(progressMap['r1'].completedIngredients).toEqual([0, 2]);
    expect(progressMap['r1'].completedSteps).toEqual([0]);
  });

  it('upserts user recipe progress with correct userId scope', async () => {
    const mockUpsert = jest.fn().mockResolvedValueOnce({ error: null });
    (supabase!.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert,
    });

    const progressObj = {
      completedIngredients: [0, 1],
      completedSteps: [0],
      lastStepIndex: 1,
      lastUpdated: 1789000000000,
    };

    const success = await progressRepository.saveProgress(
      'usr_123',
      'r1',
      progressObj
    );

    expect(success).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'usr_123',
        recipe_code: 'r1',
        completed_ingredients: [0, 1],
        completed_steps: [0],
        last_step_index: 1,
      }),
      { onConflict: 'user_id, recipe_code' }
    );
  });

  it('returns false when upsert fails due to network error', async () => {
    (supabase!.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockRejectedValueOnce(new Error('Connection timeout')),
    });

    const success = await progressRepository.saveProgress(
      'usr_123',
      'r1',
      { completedIngredients: [], completedSteps: [], lastStepIndex: 0, lastUpdated: Date.now() }
    );

    expect(success).toBe(false);
  });
});
