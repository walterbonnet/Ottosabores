// Global Application Constants for Sabores 4.0

export const APP_CONFIG = {
  PAGINATION_PAGE_SIZE: 10,
  WAVEFORM_TICK_MS: 250,
  SIMULATED_AUDIO_DURATION_SEC: 240,
  DETAIL_SECTION_STAGGER_MS: 150,
} as const;

export const DEFAULT_IMAGES = {
  RECIPE_FALLBACK: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
  FEATURED_RECIPE_FALLBACK: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600',
  ONBOARDING_1: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=85',
  ONBOARDING_2: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=85',
  ONBOARDING_3: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=85',
} as const;

export const GRANDMA_TIPS_MAP: Record<string, string> = {
  r1: 'El gran secreto de las abuelas correntinas es agregar una cucharada de jugo de naranja natural al amasar. Esto ayuda a que el chipá quede esponjoso.',
  r2: 'Revolver siempre en sentido de las agujas del reloj y usando una cuchara de madera de espinillo para que no se corte la textura.',
  r3: 'Para el guiso, agrega un chorrito de jugo de limón al apagar el fuego. Realza los sabores de la carne y el arroz de manera espectacular.',
  r4: 'Servilo siempre bien frío del refrigerador con una rodaja gruesa de queso de campo correntino (queso criollo).',
  r5: 'Humedecer la carne constantemente con salmuera de romero y ajo para que conserve su jugosidad en la estaca.',
  r6: 'Pinchá varias veces con un tenedor el chipá cuerito antes de tirarlo al aceite hirviendo para que no se infle desparejo.',
};

export const DEFAULT_GRANDMA_TIP = 'Cocinar siempre con leña o fuego de carbón vegetal para conservar el aroma tradicional del litoral.';

export const getGrandmaTip = (recipeId: string): string => {
  return GRANDMA_TIPS_MAP[recipeId] || DEFAULT_GRANDMA_TIP;
};
