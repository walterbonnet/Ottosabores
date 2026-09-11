import { festivalsRepository } from '../../src/services/repositories/festivalsRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('festivalsRepository Reliability Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches festivals list and maps media gallery properly', async () => {
    const mockOrder = jest.fn().mockResolvedValueOnce({
      data: [
        {
          id: 'f1',
          festival_code: 'fest_1',
          name: 'Fiesta del Chicharrón',
          location: 'San Luis del Palmar',
          date_display: 'Enero',
          history: 'Historia de la fiesta',
          featured_product: 'Chicharrón trenzado',
          gastronomic_route: 'Carnes Tradicionales',
          video_url: 'https://video.com',
          festival_media: [{ url: 'https://img1.com', display_order: 1 }],
        },
      ],
      error: null,
    });

    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: mockOrder,
    };

    (supabase!.from as jest.Mock).mockReturnValue(mockChain);

    const festivals = await festivalsRepository.getAll();

    expect(festivals).toHaveLength(1);
    expect(festivals[0].nombre).toBe('Fiesta del Chicharrón');
    expect(festivals[0].localidad).toBe('San Luis del Palmar');
    expect(festivals[0].galeria).toEqual(['https://img1.com']);
  });

  it('returns local FESTIVALS mock dataset when backend fetch fails', async () => {
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockRejectedValueOnce(new Error('Supabase 500 internal error')),
    };

    (supabase!.from as jest.Mock).mockReturnValue(mockChain);

    const festivals = await festivalsRepository.getAll();
    expect(festivals.length).toBeGreaterThan(0);
  });
});
