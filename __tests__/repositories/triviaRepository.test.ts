import { triviaRepository } from '../../src/services/repositories/triviaRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
  },
  isSupabaseConfigured: true,
}));

describe('triviaRepository Reliability & Edge Function Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches trivia questions via getQuestionsResult successfully', async () => {
    const mockSelect = jest.fn().mockResolvedValueOnce({
      data: [
        {
          id: 'q1',
          question_code: 'code_q1',
          question: '¿Con qué harina se prepara el Chipá Guazú?',
          explanation: 'La choclo fresco rallado es la base ancestral.',
          image_url: 'https://img.com/chipaguazu.jpg',
          trivia_answers: [
            { option_index: 0, option_text: 'Harina de trigo' },
            { option_index: 1, option_text: 'Harina de maíz y choclo' },
          ],
        },
      ],
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const res = await triviaRepository.getQuestionsResult();

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data).toHaveLength(1);
      expect(res.data[0].question).toBe('¿Con qué harina se prepara el Chipá Guazú?');
      expect(res.data[0].options).toEqual(['Harina de trigo', 'Harina de maíz y choclo']);
    }
  });

  it('returns ok: false on Supabase query failure in getQuestionsResult', async () => {
    (supabase!.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      }),
    });

    const res = await triviaRepository.getQuestionsResult();

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.type).toBe('SERVER_ERROR');
    }
  });

  it('submits answer via Edge Function submit-trivia-answer', async () => {
    (supabase!.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: { isCorrect: true, correctAnswerIndex: 1, explanation: 'Excelente' },
      error: null,
    });

    const res = await triviaRepository.submitAnswer('code_q1', 1);

    expect(supabase!.functions.invoke).toHaveBeenCalledWith('submit-trivia-answer', {
      body: { questionCode: 'code_q1', selectedOptionIndex: 1 },
    });
    expect(res.isCorrect).toBe(true);
    expect(res.explanation).toBe('Excelente');
  });
});
