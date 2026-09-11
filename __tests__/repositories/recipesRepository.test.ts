import { recipesRepository } from '../../src/services/repositories/recipesRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('recipesRepository Reliability & Boundary Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates pagination range correctly (page 0, pageSize 10 -> range(0, 9))', async () => {
    const mockRange = jest.fn().mockResolvedValueOnce({
      data: [
        { id: '1', title: 'Receta 1', category_name: 'Carnes Tradicionales', difficulty: 'Fácil', duration_display: '20 min', story: 'H1' },
      ],
      count: 25,
      error: null,
    });

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: mockRange,
    };

    (supabase!.from as jest.Mock).mockReturnValue(mockChain);

    const result = await recipesRepository.getPaginated({ page: 0, pageSize: 10 });

    expect(supabase!.from).toHaveBeenCalledWith('recipes');
    expect(mockRange).toHaveBeenCalledWith(0, 9);
    expect(result.data).toHaveLength(1);
    expect(result.hasMore).toBe(true);
  });

  it('returns hasMore = false when total items equals current dataset offset', async () => {
    const mockRange = jest.fn().mockResolvedValueOnce({
      data: [
        { id: '1', title: 'Receta 1', category_name: 'Carnes Tradicionales', difficulty: 'Fácil', duration_display: '20 min', story: 'H1' },
      ],
      count: 1,
      error: null,
    });

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: mockRange,
    };

    (supabase!.from as jest.Mock).mockReturnValue(mockChain);

    const result = await recipesRepository.getPaginated({ page: 0, pageSize: 10 });
    expect(result.hasMore).toBe(false);
  });

  it('applies category and search query filters when specified', async () => {
    const mockRange = jest.fn().mockResolvedValueOnce({ data: [], count: 0, error: null });
    const mockEq = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: mockEq,
      or: mockOr,
      order: jest.fn().mockReturnThis(),
      range: mockRange,
    };

    (supabase!.from as jest.Mock).mockReturnValue(mockChain);

    await recipesRepository.getPaginated({ page: 0, pageSize: 10, category: 'Carnes Tradicionales', searchQuery: 'chipá' });

    expect(mockEq).toHaveBeenCalledWith('category_name', 'Carnes Tradicionales');
    expect(mockOr).toHaveBeenCalledWith('title.ilike.%chipá%,story.ilike.%chipá%');
  });

  it('returns ok: false with NETWORK_ERROR when Supabase query fails in getPaginatedResult', async () => {
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockRejectedValueOnce(new Error('Network request failed')),
    };

    (supabase!.from as jest.Mock).mockReturnValue(mockChain);

    const result = await recipesRepository.getPaginatedResult({ page: 0, pageSize: 10 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('NETWORK_ERROR');
    }
  });
});

