import React, { createContext, useContext } from 'react';
import { MultimediaItem } from '../types';
import { Theme } from '../theme';
import { AuthProvider, useAuth } from './context/AuthState';
import { UserProvider, useUser } from './context/UserState';
import { PlayerProvider, usePlayer } from './context/PlayerState';
import { RemoteDataProvider, useRemoteData } from './context/RemoteDataState';

export interface RecipeProgress {
  completedIngredients: number[]; // Indices of ingredients checked
  completedSteps: number[]; // Indices of steps checked
  lastStepIndex: number; // For resuming
  lastUpdated: number;
}

export interface RecentlyViewedItem {
  id: string;
  type: 'recipe' | 'festival';
  timestamp: number;
}

export interface GlobalStateContextType {
  favorites: string[];
  recipeProgress: { [recipeId: string]: RecipeProgress };
  recentlyViewed: RecentlyViewedItem[];
  
  // Gamification & Progress
  triviaHighScore: number;
  triviaHistory: { score: number; total: number; date: number }[];
  viewedHotspots: string[];
  playedAudios: string[];
  readCuriosities: string[];
  
  // Professional release features
  isFirstLaunch: boolean;
  isDarkMode: boolean;
  completeOnboarding: () => void;
  toggleDarkMode: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    secondary: string;
    accent: string;
    white: string;
    surfaceDark: string;
    correct: string;
    incorrect: string;
  };

  // Audio Player State
  currentAudio: MultimediaItem | null;
  isPlaying: boolean;
  audioProgress: number; // 0 to 1
  currentTimeStr: string;
  durationStr: string;
  waveHeights: number[];

  // Action methods
  toggleFavorite: (recipeId: string) => void;
  updateIngredientProgress: (recipeId: string, ingredientIndex: number, isCompleted: boolean) => void;
  updateStepProgress: (recipeId: string, stepIndex: number, isCompleted: boolean) => void;
  addRecentlyViewed: (id: string, type: 'recipe' | 'festival') => void;
  addTriviaRun: (score: number, total: number) => void;
  markHotspotViewed: (id: string) => void;
  markAudioPlayed: (id: string) => void;
  markCuriosityRead: (id: string) => void;
  
  // Player controllers
  playAudio: (item: MultimediaItem) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  seekAudio: (progress: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  nextAudio: () => void;
  prevAudio: () => void;
  stopAudio: () => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

const GlobalStateConsolidator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userState = useUser();
  const playerState = usePlayer();

  const isDarkMode = userState.isDarkMode;

  const colors = {
    primary: isDarkMode ? Theme.colors.dark.primary : Theme.colors.primary,
    secondary: isDarkMode ? Theme.colors.dark.secondary : Theme.colors.secondary,
    accent: isDarkMode ? Theme.colors.dark.accent : Theme.colors.accent,
    white: '#FFFFFF',
    correct: isDarkMode ? '#3B8B52' : '#2E6F40',
    incorrect: isDarkMode ? '#E57373' : '#C85C38',
    background: isDarkMode ? Theme.colors.dark.background : Theme.colors.background,
    surface: isDarkMode ? Theme.colors.dark.surface : Theme.colors.surface,
    surfaceDark: isDarkMode ? Theme.colors.dark.surfaceElevated : Theme.colors.surfaceDark,
    text: isDarkMode ? Theme.colors.dark.text : Theme.colors.text,
    textSecondary: isDarkMode ? Theme.colors.dark.textSecondary : Theme.colors.textSecondary,
    border: isDarkMode ? Theme.colors.dark.border : Theme.colors.border,
  };

  const consolidatedValue: GlobalStateContextType = {
    favorites: userState.favorites,
    recipeProgress: userState.recipeProgress,
    recentlyViewed: userState.recentlyViewed,
    triviaHighScore: userState.triviaHighScore,
    triviaHistory: userState.triviaHistory,
    viewedHotspots: userState.viewedHotspots,
    playedAudios: userState.playedAudios,
    readCuriosities: userState.readCuriosities,
    isFirstLaunch: userState.isFirstLaunch,
    isDarkMode: userState.isDarkMode,
    completeOnboarding: userState.completeOnboarding,
    toggleDarkMode: userState.toggleDarkMode,
    colors,
    currentAudio: playerState.currentAudio,
    isPlaying: playerState.isPlaying,
    audioProgress: playerState.audioProgress,
    currentTimeStr: playerState.currentTimeStr,
    durationStr: playerState.durationStr,
    waveHeights: playerState.waveHeights,
    toggleFavorite: userState.toggleFavorite,
    updateIngredientProgress: userState.updateIngredientProgress,
    updateStepProgress: userState.updateStepProgress,
    addRecentlyViewed: userState.addRecentlyViewed,
    addTriviaRun: userState.addTriviaRun,
    markHotspotViewed: userState.markHotspotViewed,
    markAudioPlayed: userState.markAudioPlayed,
    markCuriosityRead: userState.markCuriosityRead,
    playAudio: playerState.playAudio,
    pauseAudio: playerState.pauseAudio,
    resumeAudio: playerState.resumeAudio,
    seekAudio: playerState.seekAudio,
    skipForward: playerState.skipForward,
    skipBackward: playerState.skipBackward,
    nextAudio: playerState.nextAudio,
    prevAudio: playerState.prevAudio,
    stopAudio: playerState.stopAudio,
  };

  return (
    <GlobalStateContext.Provider value={consolidatedValue}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <PlayerProvider>
          <RemoteDataProvider>
            <GlobalStateConsolidator>{children}</GlobalStateConsolidator>
          </RemoteDataProvider>
        </PlayerProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
