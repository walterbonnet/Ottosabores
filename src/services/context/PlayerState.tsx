import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { MultimediaItem } from '../../types';
import { MULTIMEDIA_ITEMS } from '../mockData';

const isWeb = Platform.OS === 'web';

const MOCK_AUDIO_URLS: { [key: string]: string } = {
  p1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  p2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  p3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  p4: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
};

interface PlayerContextType {
  currentAudio: MultimediaItem | null;
  isPlaying: boolean;
  audioProgress: number; // 0 to 1
  currentTimeStr: string;
  durationStr: string;
  waveHeights: number[];

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

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState<MultimediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('0:00');
  const [durationStr, setDurationStr] = useState<string>('0:00');
  const [waveHeights, setWaveHeights] = useState<number[]>([12, 18, 30, 24, 15, 10, 20, 28, 35, 18, 12, 16]);

  const htmlAudioRef = useRef<any>(null);
  const simTimerRef = useRef<any>(null);
  const waveTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isWeb && typeof window !== 'undefined') {
      htmlAudioRef.current = new window.Audio();
    }
  }, []);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startWaveAnimation = () => {
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    waveTimerRef.current = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 28) + 8)
      );
    }, 250);
  };

  const stopWaveAnimation = () => {
    if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    setWaveHeights([12, 18, 30, 24, 15, 10, 20, 28, 35, 18, 12, 16]);
  };

  const playAudio = (item: MultimediaItem) => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    setCurrentAudio(item);
    setIsPlaying(true);
    setAudioProgress(0);
    setCurrentTimeStr('0:00');
    setDurationStr(item.duration || '04:00');
    startWaveAnimation();

    const audioUrl = item.audioUrl || MOCK_AUDIO_URLS[item.id] || MOCK_AUDIO_URLS.p1;

    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.src = audioUrl;
      htmlAudioRef.current
        .play()
        .then(() => {
          htmlAudioRef.current.ontimeupdate = () => {
            if (htmlAudioRef.current.duration) {
              const p = htmlAudioRef.current.currentTime / htmlAudioRef.current.duration;
              setAudioProgress(p);
              setCurrentTimeStr(formatTime(htmlAudioRef.current.currentTime));
              setDurationStr(formatTime(htmlAudioRef.current.duration));
            }
          };
          htmlAudioRef.current.onended = () => {
            nextAudio();
          };
        })
        .catch(() => {
          startSimulatedTimer();
        });
    } else {
      startSimulatedTimer();
    }
  };

  const startSimulatedTimer = () => {
    let currentSec = 0;
    const totalSec = 240;
    simTimerRef.current = setInterval(() => {
      currentSec += 1;
      const prog = currentSec / totalSec;
      if (prog >= 1) {
        clearInterval(simTimerRef.current);
        nextAudio();
      } else {
        setAudioProgress(prog);
        setCurrentTimeStr(formatTime(currentSec));
        setDurationStr(formatTime(totalSec));
      }
    }, 1000);
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    stopWaveAnimation();
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
  };

  const resumeAudio = () => {
    if (!currentAudio) return;
    setIsPlaying(true);
    startWaveAnimation();
    if (isWeb && htmlAudioRef.current && htmlAudioRef.current.src) {
      htmlAudioRef.current.play().catch(() => startSimulatedTimer());
    } else {
      startSimulatedTimer();
    }
  };

  const seekAudio = (progress: number) => {
    const p = Math.max(0, Math.min(1, progress));
    setAudioProgress(p);
    if (isWeb && htmlAudioRef.current && htmlAudioRef.current.duration) {
      htmlAudioRef.current.currentTime = p * htmlAudioRef.current.duration;
      setCurrentTimeStr(formatTime(htmlAudioRef.current.currentTime));
    }
  };

  const skipForward = () => {
    if (isWeb && htmlAudioRef.current && htmlAudioRef.current.duration) {
      htmlAudioRef.current.currentTime = Math.min(
        htmlAudioRef.current.duration,
        htmlAudioRef.current.currentTime + 10
      );
    } else {
      setAudioProgress((prev) => Math.min(1, prev + 0.05));
    }
  };

  const skipBackward = () => {
    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = Math.max(0, htmlAudioRef.current.currentTime - 10);
    } else {
      setAudioProgress((prev) => Math.max(0, prev - 0.05));
    }
  };

  const nextAudio = () => {
    if (!currentAudio) return;
    const currentIndex = MULTIMEDIA_ITEMS.findIndex((m) => m.id === currentAudio.id);
    const nextIdx = (currentIndex + 1) % MULTIMEDIA_ITEMS.length;
    playAudio(MULTIMEDIA_ITEMS[nextIdx]);
  };

  const prevAudio = () => {
    if (!currentAudio) return;
    const currentIndex = MULTIMEDIA_ITEMS.findIndex((m) => m.id === currentAudio.id);
    const prevIdx = (currentIndex - 1 + MULTIMEDIA_ITEMS.length) % MULTIMEDIA_ITEMS.length;
    playAudio(MULTIMEDIA_ITEMS[prevIdx]);
  };

  const stopAudio = () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    stopWaveAnimation();
    if (isWeb && htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.src = '';
    }
    setCurrentAudio(null);
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const value: PlayerContextType = {
    currentAudio,
    isPlaying,
    audioProgress,
    currentTimeStr,
    durationStr,
    waveHeights,
    playAudio,
    pauseAudio,
    resumeAudio,
    seekAudio,
    skipForward,
    skipBackward,
    nextAudio,
    prevAudio,
    stopAudio,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
