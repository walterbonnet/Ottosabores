import { recipesRepository } from '../../src/services/repositories/recipesRepository';
import { festivalsRepository } from '../../src/services/repositories/festivalsRepository';
import { triviaRepository } from '../../src/services/repositories/triviaRepository';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
  isSupabaseConfigured: true,
}));

describe('Repository DTO Mapper & Model Transformation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('transforms Recipe Supabase DTO row to domain Recipe model via getById', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValueOnce({
      data: {
        id: 'db_rec_100',
        recipe_code: 'rec_100',
        title: 'Chipá Guazú',
        category_name: 'Panificados y Dulces',
        difficulty: 'Media',
        duration_display: '45 min',
        story: 'Historia tradicional',
        video_url: 'https://youtube.com/watch?v=123',
        audio_track_id: 'm1',
        recipe_ingredients: [
          { ingredient_name: 'Choclo fresco', display_order: 1 },
          { ingredient_name: 'Queso criollo', display_order: 2 },
        ],
        recipe_steps: [
          { step_number: 1, instruction_text: 'Rallar el choclo' },
          { step_number: 2, instruction_text: 'Mezclar con el queso y hornear' },
        ],
      },
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      or: mockOr,
      eq: mockEq,
      single: mockSingle,
    });

    const recipe = await recipesRepository.getById('rec_100');

    expect(recipe).not.toBeNull();
    expect(recipe?.id).toBe('rec_100');
    expect(recipe?.nombre).toBe('Chipá Guazú');
    expect(recipe?.categoría).toBe('Panificados y Dulces');
    expect(recipe?.duración).toBe('45 min');
    expect(recipe?.ingredientes).toEqual(['Choclo fresco', 'Queso criollo']);
    expect(recipe?.preparación).toEqual(['Rallar el choclo', 'Mezclar con el queso y hornear']);
  });

  it('transforms Festival Supabase DTO row to domain Festival model via getById', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValueOnce({
      data: {
        id: 'db_fest_1',
        festival_code: 'fest_1',
        name: 'Fiesta Nacional del Surubí',
        location: 'Goya',
        date_display: 'Mayo 2026',
        history: 'Fiesta pesquera tradicional',
        featured_product: 'Surubí al paquete',
        gastronomic_route: 'Carnes Tradicionales',
        related_recipe_code: 'r1',
        video_url: 'https://youtube.com/fest',
        festival_media: [{ url: 'https://img.com/fest1.jpg', display_order: 1 }],
      },
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      or: mockOr,
      eq: mockEq,
      single: mockSingle,
    });

    const festival = await festivalsRepository.getById('fest_1');

    expect(festival).not.toBeNull();
    expect(festival?.id).toBe('fest_1');
    expect(festival?.nombre).toBe('Fiesta Nacional del Surubí');
    expect(festival?.localidad).toBe('Goya');
    expect(festival?.galeria).toEqual(['https://img.com/fest1.jpg']);
  });

  it('transforms Trivia Supabase DTO row to domain TriviaQuestion model via getQuestions', async () => {
    const mockSelect = jest.fn().mockResolvedValueOnce({
      data: [
        {
          id: 'triv_1',
          question: '¿Qué ingrediente principal lleva el Mbaipy?',
          explanation: 'El Mbaipy correntino se elabora tradicionalmente con harina de maíz.',
          image_url: 'https://img.com/mbaipy.jpg',
          trivia_answers: [
            { option_index: 0, option_text: 'Harina de trigo', is_correct: false },
            { option_index: 1, option_text: 'Harina de maíz', is_correct: true },
            { option_index: 2, option_text: 'Arroz', is_correct: false },
          ],
        },
      ],
      error: null,
    });

    (supabase!.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const questions = await triviaRepository.getQuestions();

    expect(questions).toHaveLength(1);
    expect(questions[0].id).toBe('triv_1');
    expect(questions[0].question).toBe('¿Qué ingrediente principal lleva el Mbaipy?');
    expect(questions[0].options).toEqual(['Harina de trigo', 'Harina de maíz', 'Arroz']);
  });
});
