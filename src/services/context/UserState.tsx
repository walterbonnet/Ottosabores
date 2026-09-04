import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { RecipeProgress, RecentlyViewedItem } from '../GlobalStateContext';
import { favoritesRepository } from '../repositories/favoritesRepository';
import { progressRepository } from '../repositories/progressRepository';
import { useAuth } from './AuthState';

const isWeb = Platform.OS === 'web';

const getLocalStorageItem = (key: string): string | null => {
  try {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn(e);
  }
  return null;
};

const setLocalStorageItem = (key: string, value: string): void => {
  try {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(e);
  }
};

interface UserContextType {
  favorites: string[];
  recipeProgress: { [recipeId: string]: RecipeProgress };
  recentlyViewed: RecentlyViewedItem[];
  triviaHighScore: number;
  triviaHistory: { score: number; total: number; date: number }[];
  viewedHotspots: string[];
  playedAudios: string[];
  readCuriosities: string[];
  isFirstLaunch: boolean;
  isDarkMode: boolean;

  completeOnboarding: () => void;
  toggleDarkMode: () => void;
  toggleFavorite: (recipeId: string) => void;
  updateIngredientProgress: (recipeId: string, ingredientIndex: number, isCompleted: boolean) => void;
  updateStepProgress: (recipeId: string, stepIndex: number, isCompleted: boolean) => void;
  addRecentlyViewed: (id: string, type: 'recipe' | 'festival') => void;
  addTriviaRun: (score: number, total: number) => void;
  markHotspotViewed: (id: string) => void;
  markAudioPlayed: (id: string) => void;
  markCuriosityRead: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(() => {
    const saved = getLocalStorageItem('sabores_first_launch');
    return saved === null ? true : saved === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = getLocalStorageItem('sabores_dark_mode');
    return saved === 'true';
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = getLocalStorageItem('sabores_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [recipeProgress, setRecipeProgress] = useState<{ [recipeId: string]: RecipeProgress }>(() => {
    const saved = getLocalStorageItem('sabores_progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(() => {
    const saved = getLocalStorageItem('sabores_recently');
    return saved ? JSON.parse(saved) : [];
  });

  const [triviaHighScore, setTriviaHighScore] = useState<number>(() => {
    const saved = getLocalStorageItem('sabores_trivia_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [triviaHistory, setTriviaHistory] = useState<{ score: number; total: number; date: number }[]>(() => {
    const saved = getLocalStorageItem('sabores_trivia_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewedHotspots, setViewedHotspots] = useState<string[]>(() => {
    const saved = getLocalStorageItem('sabores_viewed_hotspots');
    return saved ? JSON.parse(saved) : [];
  });

  const [playedAudios, setPlayedAudios] = useState<string[]>(() => {
    const saved = getLocalStorageItem('sabores_played_audios');
    return saved ? JSON.parse(saved) : [];
  });

  const [readCuriosities, setReadCuriosities] = useState<string[]>(() => {
    const saved = getLocalStorageItem('sabores_read_curiosities');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with Supabase on user login
  useEffect(() => {
    if (user?.id) {
      favoritesRepository.getFavorites(user.id).then((remoteFavs) => {
        if (remoteFavs.length > 0) {
          setFavorites(remoteFavs);
          setLocalStorageItem('sabores_favorites', JSON.stringify(remoteFavs));
        }
      });

      progressRepository.getRecipeProgress(user.id).then((remoteProg) => {
        if (Object.keys(remoteProg).length > 0) {
          setRecipeProgress(remoteProg);
          setLocalStorageItem('sabores_progress', JSON.stringify(remoteProg));
        }
      });
    }
  }, [user?.id]);

  const completeOnboarding = () => {
    setIsFirstLaunch(false);
    setLocalStorageItem('sabores_first_launch', 'false');
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      setLocalStorageItem('sabores_dark_mode', next ? 'true' : 'false');
      return next;
    });
  };

  const toggleFavorite = (recipeId: string) => {
    const isFav = favorites.includes(recipeId);
    const updated = isFav ? favorites.filter((id) => id !== recipeId) : [...favorites, recipeId];
    setFavorites(updated);
    setLocalStorageItem('sabores_favorites', JSON.stringify(updated));

    if (user?.id) {
      if (isFav) {
        favoritesRepository.removeFavorite(user.id, recipeId);
      } else {
        favoritesRepository.addFavorite(user.id, recipeId);
      }
    }
  };

  const updateIngredientProgress = (recipeId: string, ingredientIndex: number, isCompleted: boolean) => {
    const current = recipeProgress[recipeId] || {
      completedIngredients: [],
      completedSteps: [],
      lastStepIndex: 0,
      lastUpdated: Date.now(),
    };

    let updatedIngredients = [...current.completedIngredients];
    if (isCompleted) {
      if (!updatedIngredients.includes(ingredientIndex)) updatedIngredients.push(ingredientIndex);
    } else {
      updatedIngredients = updatedIngredients.filter((idx) => idx !== ingredientIndex);
    }

    const updatedProg: RecipeProgress = {
      ...current,
      completedIngredients: updatedIngredients,
      lastUpdated: Date.now(),
    };

    const newAllProgress = { ...recipeProgress, [recipeId]: updatedProg };
    setRecipeProgress(newAllProgress);
    setLocalStorageItem('sabores_progress', JSON.stringify(newAllProgress));

    if (user?.id) {
      progressRepository.saveProgress(user.id, recipeId, updatedProg);
    }
  };

  const updateStepProgress = (recipeId: string, stepIndex: number, isCompleted: boolean) => {
    const current = recipeProgress[recipeId] || {
      completedIngredients: [],
      completedSteps: [],
      lastStepIndex: 0,
      lastUpdated: Date.now(),
    };

    let updatedSteps = [...current.completedSteps];
    if (isCompleted) {
      if (!updatedSteps.includes(stepIndex)) updatedSteps.push(stepIndex);
    } else {
      updatedSteps = updatedSteps.filter((idx) => idx !== stepIndex);
    }

    const updatedProg: RecipeProgress = {
      ...current,
      completedSteps: updatedSteps,
      lastStepIndex: isCompleted ? stepIndex : Math.max(0, stepIndex - 1),
      lastUpdated: Date.now(),
    };

    const newAllProgress = { ...recipeProgress, [recipeId]: updatedProg };
    setRecipeProgress(newAllProgress);
    setLocalStorageItem('sabores_progress', JSON.stringify(newAllProgress));

    if (user?.id) {
      progressRepository.saveProgress(user.id, recipeId, updatedProg);
    }
  };

  const addRecentlyViewed = (id: string, type: 'recipe' | 'festival') => {
    const filtered = recentlyViewed.filter((item) => !(item.id === id && item.type === type));
    const updated = [{ id, type, timestamp: Date.now() }, ...filtered].slice(0, 10);
    setRecentlyViewed(updated);
    setLocalStorageItem('sabores_recently', JSON.stringify(updated));
  };

  const addTriviaRun = (score: number, total: number) => {
    const updatedHistory = [{ score, total, date: Date.now() }, ...triviaHistory].slice(0, 20);
    setTriviaHistory(updatedHistory);
    setLocalStorageItem('sabores_trivia_history', JSON.stringify(updatedHistory));

    if (score > triviaHighScore) {
      setTriviaHighScore(score);
      setLocalStorageItem('sabores_trivia_highscore', score.toString());
    }
  };

  const markHotspotViewed = (id: string) => {
    if (!viewedHotspots.includes(id)) {
      const updated = [...viewedHotspots, id];
      setViewedHotspots(updated);
      setLocalStorageItem('sabores_viewed_hotspots', JSON.stringify(updated));
    }
  };

  const markAudioPlayed = (id: string) => {
    if (!playedAudios.includes(id)) {
      const updated = [...playedAudios, id];
      setPlayedAudios(updated);
      setLocalStorageItem('sabores_played_audios', JSON.stringify(updated));
    }
  };

  const markCuriosityRead = (id: string) => {
    if (!readCuriosities.includes(id)) {
      const updated = [...readCuriosities, id];
      setReadCuriosities(updated);
      setLocalStorageItem('sabores_read_curiosities', JSON.stringify(updated));
    }
  };

  const value: UserContextType = {
    favorites,
    recipeProgress,
    recentlyViewed,
    triviaHighScore,
    triviaHistory,
    viewedHotspots,
    playedAudios,
    readCuriosities,
    isFirstLaunch,
    isDarkMode,
    completeOnboarding,
    toggleDarkMode,
    toggleFavorite,
    updateIngredientProgress,
    updateStepProgress,
    addRecentlyViewed,
    addTriviaRun,
    markHotspotViewed,
    markAudioPlayed,
    markCuriosityRead,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
