import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { MultimediaItem } from '../types';
import { MULTIMEDIA_ITEMS } from './mockData';

// Custom URLs for audio loops (royalty free public MP3 files)
const MOCK_AUDIO_URLS: { [key: string]: string } = {
  p1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  p2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  p3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  p4: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
};

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

interface GlobalStateContextType {
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

const isWeb = Platform.OS === 'web';

const getLocalStorageItem = (key: string): string | null => {
  try {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return null;
};

const setLocalStorageItem = (key: string, value: string): void => {
  try {
    if (isWeb && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn('Storage write error:', e);
  }
};

const formatSeconds = (secs: number) => {
  if (isNaN(secs) || secs === Infinity) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Onboarding & Dark Mode ---
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(() => {
    const saved = getLocalStorageItem('sabores_first_launch');
    return saved === null ? true : saved === 'false' ? false : true;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = getLocalStorageItem('sabores_dark_mode');
    return saved === 'true';
  });

  const completeOnboarding = () => {
    setIsFirstLaunch(false);
    setLocalStorageItem('sabores_first_launch', 'false');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      setLocalStorageItem('sabores_dark_mode', next ? 'true' : 'false');
      return next;
    });
  };

  const colors = {
    primary: '#C85C38',
    secondary: '#2E6F40',
    accent: '#DFB15B',
    white: '#FFFFFF',
    correct: '#2E6F40',
    incorrect: '#C85C38',
    background: isDarkMode ? '#1C1917' : '#F8F6F0',
    surface: isDarkMode ? '#292524' : '#FFFDF9',
    surfaceDark: isDarkMode ? '#3E3A33' : '#EDE8DF',
    text: isDarkMode ? '#F5F5F4' : '#3E3A33',
    textSecondary: isDarkMode ? '#A8A29E' : '#6E675F',
    border: isDarkMode ? '#44403C' : '#E8E2D5',
  };

  // --- Persistent State ---
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = getLocalStorageItem('sabores_favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn(e); }
    }
    return [];
  });
  
  const [recipeProgress, setRecipeProgress] = useState<{ [recipeId: string]: RecipeProgress }>(() => {
    const saved = getLocalStorageItem('sabores_progress');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn(e); }
    }
    return {};
  });

  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(() => {
    const saved = getLocalStorageItem('sabores_recently');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn(e); }
    }
    return [];
  });

  const [triviaHighScore, setTriviaHighScore] = useState<number>(() => {
    const saved = getLocalStorageItem('sabores_trivia_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [triviaHistory, setTriviaHistory] = useState<{ score: number; total: number; date: number }[]>(() => {
    const saved = getLocalStorageItem('sabores_trivia_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn(e); }
    }
    return [];
  });

  const [viewedHotspots, setViewedHotspots] = useState<string[]>(() => {
    const saved = getLocalStorageItem('sabores_viewed_hotspots');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn(e); }
    }
    return [];
  });

  const [playedAudios, setPlayedAudios] = useState<string[]>(() => {
    const saved = getLocalStorageItem('sabores_played_audios');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn(e); }
    }
    return [];
  });

  const [readCuriosities, setReadCuriosities] = useState<string[]>(() => {
    const saved = getLocalStorageItem('sabores_read_curiosities');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.warn(e); }
    }
    return [];
  });

  // --- Audio Player State ---
  const [currentAudio, setCurrentAudio] = useState<MultimediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('0:00');
  const [durationStr, setDurationStr] = useState<string>('0:00');
  const [waveHeights, setWaveHeights] = useState<number[]>([12, 18, 30, 24, 15, 10, 20, 28, 35, 18, 12, 16]);

  // Browser Audio ref
  const htmlAudioRef = useRef<any>(null);
  // Simulated timers for native or fail cases
  const simTimerRef = useRef<any>(null);
  const waveTimerRef = useRef<any>(null);

  // --- Initialize Refs and Web Audio ---
  useEffect(() => {
    if (isWeb && typeof window !== 'undefined') {
      htmlAudioRef.current = new window.Audio();
    }
  }, []);

  // --- Helpers to persist changes ---
  const saveFavorites = (newFavs: string[]) => {
    setFavorites(newFavs);
    setLocalStorageItem('sabores_favorites', JSON.stringify(newFavs));
  };

  const saveRecipeProgress = (newProgress: { [recipeId: string]: RecipeProgress }) => {
    setRecipeProgress(newProgress);
    setLocalStorageItem('sabores_progress', JSON.stringify(newProgress));
  };

  const saveRecentlyViewed = (newRecent: RecentlyViewedItem[]) => {
    setRecentlyViewed(newRecent);
    setLocalStorageItem('sabores_recently', JSON.stringify(newRecent));
  };

  // --- Actions ---
  const toggleFavorite = (recipeId: string) => {
    if (favorites.includes(recipeId)) {
      saveFavorites(favorites.filter(id => id !== recipeId));
    } else {
      saveFavorites([...favorites, recipeId]);
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
      if (!updatedIngredients.includes(ingredientIndex)) {
        updatedIngredients.push(ingredientIndex);
      }
    } else {
      updatedIngredients = updatedIngredients.filter(idx => idx !== ingredientIndex);
    }

    const updated = {
      ...recipeProgress,
      [recipeId]: {
        ...current,
        completedIngredients: updatedIngredients,
        lastUpdated: Date.now(),
      },
    };
    saveRecipeProgress(updated);
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
      if (!updatedSteps.includes(stepIndex)) {
        updatedSteps.push(stepIndex);
      }
    } else {
      updatedSteps = updatedSteps.filter(idx => idx !== stepIndex);
    }

    // Set last step index as current selected step
    const lastStepIndex = isCompleted ? stepIndex : Math.max(0, stepIndex - 1);

    const updated = {
      ...recipeProgress,
      [recipeId]: {
        ...current,
        completedSteps: updatedSteps,
        lastStepIndex,
        lastUpdated: Date.now(),
      },
    };
    saveRecipeProgress(updated);
  };

  const addRecentlyViewed = (id: string, type: 'recipe' | 'festival') => {
    // Exclude duplicates and add to start
    const cleanList = recentlyViewed.filter(item => !(item.id === id && item.type === type));
    const updated = [
      { id, type, timestamp: Date.now() },
      ...cleanList,
    ].slice(0, 10); // Keep last 10
    saveRecentlyViewed(updated);
  };

  const addTriviaRun = (score: number, total: number) => {
    const newRun = { score, total, date: Date.now() };
    const updatedHistory = [newRun, ...triviaHistory];
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

  // --- Player Controllers and Timers ---
  const parseDurationStr = (durationStr: string) => {
    const parts = durationStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const startSimulatedTimer = (targetAudio: MultimediaItem) => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    
    const durationSec = parseDurationStr(targetAudio.duration);
    setDurationStr(targetAudio.duration);
    
    let currentSec = Math.floor(audioProgress * durationSec);
    
    simTimerRef.current = setInterval(() => {
      currentSec += 1;
      if (currentSec >= durationSec) {
        clearInterval(simTimerRef.current);
        setIsPlaying(false);
        setAudioProgress(0);
        setCurrentTimeStr('0:00');
        nextAudio();
      } else {
        setAudioProgress(currentSec / durationSec);
        setCurrentTimeStr(formatSeconds(currentSec));
      }
    }, 1000);
  };

  const playAudio = (item: MultimediaItem) => {
    if (currentAudio?.id === item.id) {
      resumeAudio();
      return;
    }

    if (simTimerRef.current) clearInterval(simTimerRef.current);

    setCurrentAudio(item);
    setAudioProgress(0);
    setCurrentTimeStr('0:00');
    setDurationStr(item.duration);

    const audioUrl = MOCK_AUDIO_URLS[item.id] || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.src = audioUrl;
      htmlAudioRef.current.load();
      htmlAudioRef.current.play().catch((err: any) => {
        console.warn('Audio play error, falling back to simulation:', err);
        setIsPlaying(true);
        startSimulatedTimer(item);
      });
    } else {
      setIsPlaying(true);
      startSimulatedTimer(item);
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    } else {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    }
  };

  const resumeAudio = () => {
    if (!currentAudio) return;
    setIsPlaying(true);
    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.play().catch(() => {
        startSimulatedTimer(currentAudio);
      });
    } else {
      startSimulatedTimer(currentAudio);
    }
  };

  const seekAudio = (progressVal: number) => {
    if (!currentAudio) return;
    const progress = Math.max(0, Math.min(1, progressVal));
    
    if (isWeb && htmlAudioRef.current && htmlAudioRef.current.duration) {
      htmlAudioRef.current.currentTime = progress * htmlAudioRef.current.duration;
      setAudioProgress(progress);
    } else {
      // Simulate seek
      setAudioProgress(progress);
      const durationSec = parseDurationStr(currentAudio.duration);
      setCurrentTimeStr(formatSeconds(progress * durationSec));
      if (isPlaying) {
        startSimulatedTimer(currentAudio);
      }
    }
  };

  const skipForward = () => {
    if (!currentAudio) return;
    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = Math.min(htmlAudioRef.current.duration || 0, htmlAudioRef.current.currentTime + 10);
    } else {
      const durationSec = parseDurationStr(currentAudio.duration);
      const currentSec = audioProgress * durationSec;
      seekAudio(Math.min(durationSec - 1, currentSec + 10) / durationSec);
    }
  };

  const skipBackward = () => {
    if (!currentAudio) return;
    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = Math.max(0, htmlAudioRef.current.currentTime - 10);
    } else {
      const durationSec = parseDurationStr(currentAudio.duration);
      const currentSec = audioProgress * durationSec;
      seekAudio(Math.max(0, currentSec - 10) / durationSec);
    }
  };

  const nextAudio = () => {
    if (!currentAudio) return;
    const currentIndex = MULTIMEDIA_ITEMS.findIndex(item => item.id === currentAudio.id);
    const nextIndex = (currentIndex + 1) % MULTIMEDIA_ITEMS.length;
    playAudio(MULTIMEDIA_ITEMS[nextIndex]);
  };

  const prevAudio = () => {
    if (!currentAudio) return;
    const currentIndex = MULTIMEDIA_ITEMS.findIndex(item => item.id === currentAudio.id);
    const prevIndex = currentIndex === 0 ? MULTIMEDIA_ITEMS.length - 1 : currentIndex - 1;
    playAudio(MULTIMEDIA_ITEMS[prevIndex]);
  };

  const stopAudio = () => {
    pauseAudio();
    setCurrentAudio(null);
    setAudioProgress(0);
    setCurrentTimeStr('0:00');
  };

  // --- HTML5 Browser Audio Event Handlers ---
  useEffect(() => {
    const audioObj = htmlAudioRef.current;
    if (!audioObj) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setCurrentTimeStr('0:00');
      nextAudio();
    };
    const onTimeUpdate = () => {
      if (audioObj.duration) {
        setAudioProgress(audioObj.currentTime / audioObj.duration);
        setCurrentTimeStr(formatSeconds(audioObj.currentTime));
      }
    };
    const onDurationChange = () => {
      setDurationStr(formatSeconds(audioObj.duration || 0));
    };

    audioObj.addEventListener('play', onPlay);
    audioObj.addEventListener('pause', onPause);
    audioObj.addEventListener('ended', onEnded);
    audioObj.addEventListener('timeupdate', onTimeUpdate);
    audioObj.addEventListener('durationchange', onDurationChange);

    return () => {
      audioObj.removeEventListener('play', onPlay);
      audioObj.removeEventListener('pause', onPause);
      audioObj.removeEventListener('ended', onEnded);
      audioObj.removeEventListener('timeupdate', onTimeUpdate);
      audioObj.removeEventListener('durationchange', onDurationChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudio]);

  // Soundwave Animation
  useEffect(() => {
    if (isPlaying) {
      waveTimerRef.current = setInterval(() => {
        setWaveHeights(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 32) + 6)
        );
      }, 150);
    } else {
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
      setTimeout(() => {
        setWaveHeights([12, 18, 30, 24, 15, 10, 20, 28, 35, 18, 12, 16]);
      }, 0);
    }

    return () => {
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    };
  }, [isPlaying]);

  return (
    <GlobalStateContext.Provider
      value={{
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
        colors,
        currentAudio,
        isPlaying,
        audioProgress,
        currentTimeStr,
        durationStr,
        waveHeights,
        toggleFavorite,
        updateIngredientProgress,
        updateStepProgress,
        addRecentlyViewed,
        addTriviaRun,
        markHotspotViewed,
        markAudioPlayed,
        markCuriosityRead,
        playAudio,
        pauseAudio,
        resumeAudio,
        seekAudio,
        skipForward,
        skipBackward,
        nextAudio,
        prevAudio,
        stopAudio,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
