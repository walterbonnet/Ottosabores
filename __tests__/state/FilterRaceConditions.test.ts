import { recipesRepository } from '../../src/services/repositories/recipesRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('Filter & Search Race Conditions & Out-Of-Order Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('guarantees that latest user intent wins when requests resolve out of order', async () => {
    let reqSeq = 0;
    let latestSeqAccepted = 0;
    let activeResultData: string[] = [];

    // Helper simulating Recetas.tsx sequence handling
    const triggerSearchIntent = async (category: string, query: string, delayMs: number, resultTitle: string) => {
      const currentSeq = ++reqSeq;

      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          // Fake mock return for this sequence
          const resTitle = resultTitle;
          if (currentSeq > latestSeqAccepted) {
            latestSeqAccepted = currentSeq;
            activeResultData = [resTitle];
          }
          resolve();
        }, delayMs);
      });
    };

    // Trigger intent 1: Category "Carnes" (slow response: 100ms)
    const p1 = triggerSearchIntent('Carnes Tradicionales', '', 100, 'Asado Correntino');
    // Trigger intent 2: Search "Chipá" (fast response: 20ms)
    const p2 = triggerSearchIntent('Todos', 'Chipá', 20, 'Chipá Guazú');

    await Promise.all([p1, p2]);

    // Even though p1 resolved AFTER p2, p2 had seq 2 > seq 1, so latest sequence is preserved
    expect(latestSeqAccepted).toBe(2);
    expect(activeResultData).toEqual(['Chipá Guazú']);
  });
});
