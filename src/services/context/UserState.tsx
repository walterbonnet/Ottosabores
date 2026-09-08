import React, { createContext, useContext, useState, useEffect } from 'react';
import { RecipeProgress, RecentlyViewedItem } from '../GlobalStateContext';
import { favoritesRepository } from '../repositories/favoritesRepository';
import { progressRepository } from '../repositories/progressRepository';
import { StorageService } from '../storage/StorageService';
import { useAuth } from './AuthState';

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

  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recipeProgress, setRecipeProgress] = useState<{ [recipeId: string]: RecipeProgress }>({});
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [triviaHighScore, setTriviaHighScore] = useState<number>(0);
  const [triviaHistory, setTriviaHistory] = useState<{ score: number; total: number; date: number }[]>([]);
  const [viewedHotspots, setViewedHotspots] = useState<string[]>([]);
  const [playedAudios, setPlayedAudios] = useState<string[]>([]);
  const [readCuriosities, setReadCuriosities] = useState<string[]>([]);

  // Hydrate local state asynchronously from cross-platform StorageService
  useEffect(() => {
    let isMounted = true;
    const hydrateLocalState = async () => {
      try {
        const [
          savedFirstLaunch,
          savedDarkMode,
          savedFavs,
          savedProg,
          savedRecently,
          savedHighScore,
          savedHistory,
          savedHotspots,
          savedAudios,
          savedCuriosities,
        ] = await Promise.all([
          StorageService.getItem('sabores_first_launch'),
          StorageService.getItem('sabores_dark_mode'),
          StorageService.getItem('sabores_favorites'),
          StorageService.getItem('sabores_progress'),
          StorageService.getItem('sabores_recently'),
          StorageService.getItem('sabores_trivia_highscore'),
          StorageService.getItem('sabores_trivia_history'),
          StorageService.getItem('sabores_viewed_hotspots'),
          StorageService.getItem('sabores_played_audios'),
          StorageService.getItem('sabores_read_curiosities'),
        ]);

        if (!isMounted) return;

        if (savedFirstLaunch !== null) setIsFirstLaunch(savedFirstLaunch === 'true');
        if (savedDarkMode !== null) setIsDarkMode(savedDarkMode === 'true');
        if (savedFavs) setFavorites(JSON.parse(savedFavs));
        if (savedProg) setRecipeProgress(JSON.parse(savedProg));
        if (savedRecently) setRecentlyViewed(JSON.parse(savedRecently));
        if (savedHighScore) setTriviaHighScore(parseInt(savedHighScore, 10) || 0);
        if (savedHistory) setTriviaHistory(JSON.parse(savedHistory));
        if (savedHotspots) setViewedHotspots(JSON.parse(savedHotspots));
        if (savedAudios) setPlayedAudios(JSON.parse(savedAudios));
        if (savedCuriosities) setReadCuriosities(JSON.parse(savedCuriosities));
      } catch (e) {
        console.warn('UserState hydration warning:', e);
      }
    };

    hydrateLocalState();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with Supabase on user login
  useEffect(() => {
    if (user?.id) {
      favoritesRepository.getFavorites(user.id).then((remoteFavs) => {
        if (remoteFavs.length > 0) {
          setFavorites(remoteFavs);
          StorageService.setItem('sabores_favorites', JSON.stringify(remoteFavs));
        }
      });

      progressRepository.getRecipeProgress(user.id).then((remoteProg) => {
        if (Object.keys(remoteProg).length > 0) {
          setRecipeProgress(remoteProg);
          StorageService.setItem('sabores_progress', JSON.stringify(remoteProg));
        }
      });
    }
  }, [user?.id]);

  const completeOnboarding = () => {
    setIsFirstLaunch(false);
    StorageService.setItem('sabores_first_launch', 'false');
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      StorageService.setItem('sabores_dark_mode', next ? 'true' : 'false');
      return next;
    });
  };

  const toggleFavorite = (recipeId: string) => {
    const isFav = favorites.includes(recipeId);
    const updated = isFav ? favorites.filter((id) => id !== recipeId) : [...favorites, recipeId];
    setFavorites(updated);
    StorageService.setItem('sabores_favorites', JSON.stringify(updated));

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
    StorageService.setItem('sabores_progress', JSON.stringify(newAllProgress));

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
    StorageService.setItem('sabores_progress', JSON.stringify(newAllProgress));

    if (user?.id) {
      progressRepository.saveProgress(user.id, recipeId, updatedProg);
    }
  };

  const addRecentlyViewed = (id: string, type: 'recipe' | 'festival') => {
    const filtered = recentlyViewed.filter((item) => !(item.id === id && item.type === type));
    const updated = [{ id, type, timestamp: Date.now() }, ...filtered].slice(0, 10);
    setRecentlyViewed(updated);
    StorageService.setItem('sabores_recently', JSON.stringify(updated));
  };

  const addTriviaRun = (score: number, total: number) => {
    const updatedHistory = [{ score, total, date: Date.now() }, ...triviaHistory].slice(0, 20);
    setTriviaHistory(updatedHistory);
    StorageService.setItem('sabores_trivia_history', JSON.stringify(updatedHistory));

    if (score > triviaHighScore) {
      setTriviaHighScore(score);
      StorageService.setItem('sabores_trivia_highscore', score.toString());
    }
  };

  const markHotspotViewed = (id: string) => {
    if (!viewedHotspots.includes(id)) {
      const updated = [...viewedHotspots, id];
      setViewedHotspots(updated);
      StorageService.setItem('sabores_viewed_hotspots', JSON.stringify(updated));
    }
  };

  const markAudioPlayed = (id: string) => {
    if (!playedAudios.includes(id)) {
      const updated = [...playedAudios, id];
      setPlayedAudios(updated);
      StorageService.setItem('sabores_played_audios', JSON.stringify(updated));
    }
  };

  const markCuriosityRead = (id: string) => {
    if (!readCuriosities.includes(id)) {
      const updated = [...readCuriosities, id];
      setReadCuriosities(updated);
      StorageService.setItem('sabores_read_curiosities', JSON.stringify(updated));
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
