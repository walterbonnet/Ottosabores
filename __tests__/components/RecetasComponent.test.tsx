import React from 'react';
import renderer, { act } from 'react-test-renderer';
import RecetasScreen from '../../src/screens/Recetas';
import { recipesRepository } from '../../src/services/repositories/recipesRepository';
import { createSuccessResult, createErrorResult } from '../../src/services/errors/AppError';

// Mock subcomponents to prevent heavy native layout ticks in Jest
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('../../src/components/Header', () => 'Header');
jest.mock('../../src/components/Card', () => 'Card');
jest.mock('../../src/components/SkeletonLoader', () => 'SkeletonLoader');
jest.mock('../../src/components/RecipeDetailModal', () => 'RecipeDetailModal');

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

// Mock useGlobalState
jest.mock('../../src/services/GlobalStateContext', () => ({
  useGlobalState: () => ({
    favorites: [],
    toggleFavorite: jest.fn(),
    recipeProgress: {},
    updateIngredientProgress: jest.fn(),
    updateStepProgress: jest.fn(),
    addRecentlyViewed: jest.fn(),
    recentlyViewed: [],
    colors: {
      background: '#FFF',
      surface: '#F5F5F5',
      text: '#000',
      textSecondary: '#666',
      border: '#DDD',
      primary: '#C85C38',
      secondary: '#2E6F40',
      accent: '#DFB15B',
      white: '#FFF',
    },
    isDarkMode: false,
  }),
}));

// Mock recipesRepository
jest.mock('../../src/services/repositories/recipesRepository', () => ({
  recipesRepository: {
    getPaginatedResult: jest.fn(),
    getPaginated: jest.fn(),
  },
}));

describe('Recetas Component Controlled Error & Retry UI Tests', () => {
  beforeEach(() => {
    jest.setTimeout(15000);
    jest.clearAllMocks();
  });

  it('renders controlled error container and permits Retry when initial load fails', async () => {
    // 1. Mock network error on initial load
    (recipesRepository.getPaginatedResult as jest.Mock).mockResolvedValueOnce(
      createErrorResult('NETWORK_ERROR', 'Error de conexión a internet o red no disponible')
    );

    let component: renderer.ReactTestRenderer;
    await act(async () => {
      component = renderer.create(<RecetasScreen />);
    });

    const root = component!.root;
    const errorContainer = root.findByProps({ testID: 'recipes-error-container' });
    expect(errorContainer).toBeTruthy();

    const retryButton = root.findByProps({ testID: 'retry-button' });
    expect(retryButton).toBeTruthy();

    // 2. Mock success result on retry click
    (recipesRepository.getPaginatedResult as jest.Mock).mockResolvedValueOnce(
      createSuccessResult({
        data: [
          {
            id: 'r1',
            nombre: 'Mbaipy Correntino',
            categoría: 'Guisos y Comidas Populares',
            historia: 'Plato tradicional de maíz.',
            ingredientes: ['Choclo'],
            preparación: ['Cocinar'],
            duración: '40 min',
            dificultad: 'Media',
          },
        ],
        hasMore: false,
      })
    );

    await act(async () => {
      retryButton.props.onPress();
    });

    expect(recipesRepository.getPaginatedResult).toHaveBeenCalledTimes(2);
  });
});
