import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { PlayerProvider, usePlayer } from '../../src/services/context/PlayerState';
import { MultimediaItem } from '../../src/types';

const mockAudio1: MultimediaItem = {
  id: 'm1',
  title: 'Podcast El Fuego del Taragüí',
  artist: 'Abuela María',
  duration: '04:00',
  type: 'podcast',
  image: 'https://img.com/audio1.jpg',
  audioUrl: 'https://audio.com/m1.mp3',
};

const mockAudio2: MultimediaItem = {
  id: 'm2',
  title: 'Secretos del Chipá',
  artist: 'Abuela Carmen',
  duration: '03:30',
  type: 'recipe_audio',
  image: 'https://img.com/audio2.jpg',
  audioUrl: 'https://audio.com/m2.mp3',
};

let capturedPlayer: ReturnType<typeof usePlayer> | null = null;

const TestComponent = () => {
  capturedPlayer = usePlayer();
  return null;
};

describe('PlayerState Timer & Lifecycle Leak Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    capturedPlayer = null;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('starts playback and updates progress over fake timer ticks', () => {
    act(() => {
      renderer.create(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );
    });

    expect(capturedPlayer?.isPlaying).toBe(false);
    expect(capturedPlayer?.currentAudio).toBeNull();

    act(() => {
      capturedPlayer?.playAudio(mockAudio1);
    });

    expect(capturedPlayer?.isPlaying).toBe(true);
    expect(capturedPlayer?.currentAudio?.id).toBe('m1');

    // Fast-forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(capturedPlayer?.audioProgress).toBeGreaterThan(0);
  });

  it('pauses and resumes playback without creating duplicate interval timers', () => {
    act(() => {
      renderer.create(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );
    });

    act(() => {
      capturedPlayer?.playAudio(mockAudio1);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    const progressBeforePause = capturedPlayer?.audioProgress;

    act(() => {
      capturedPlayer?.pauseAudio();
    });

    expect(capturedPlayer?.isPlaying).toBe(false);

    // Fast-forward timers while paused
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Progress should not change while paused
    expect(capturedPlayer?.audioProgress).toBe(progressBeforePause);

    // Resume
    act(() => {
      capturedPlayer?.resumeAudio();
    });

    expect(capturedPlayer?.isPlaying).toBe(true);
  });

  it('cleans up previous timer when switching directly to a new audio track', () => {
    act(() => {
      renderer.create(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );
    });

    act(() => {
      capturedPlayer?.playAudio(mockAudio1);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Switch to track 2
    act(() => {
      capturedPlayer?.playAudio(mockAudio2);
    });

    expect(capturedPlayer?.currentAudio?.id).toBe('m2');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(capturedPlayer?.isPlaying).toBe(true);
  });

  it('clears all active timers when stopAudio is called', () => {
    act(() => {
      renderer.create(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );
    });

    act(() => {
      capturedPlayer?.playAudio(mockAudio1);
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      capturedPlayer?.stopAudio();
    });

    expect(capturedPlayer?.isPlaying).toBe(false);
    expect(capturedPlayer?.currentAudio).toBeNull();
    expect(capturedPlayer?.audioProgress).toBe(0);
  });
});
