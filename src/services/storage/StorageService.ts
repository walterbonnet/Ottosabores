import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isServer = typeof window === 'undefined';

export const StorageService = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isServer) return null;
      if (Platform.OS === 'web' && typeof window.localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn(`StorageService.getItem error for key "${key}":`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isServer) return;
      if (Platform.OS === 'web' && typeof window.localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`StorageService.setItem error for key "${key}":`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isServer) return;
      if (Platform.OS === 'web' && typeof window.localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`StorageService.removeItem error for key "${key}":`, error);
    }
  },
};
