import { StorageService } from '../../src/services/storage/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('StorageService Unit & Reliability Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores and retrieves string items successfully', async () => {
    const testData = JSON.stringify({ favorites: ['r1', 'r2'], theme: 'dark' });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(testData);

    await StorageService.setItem('user_prefs', testData);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user_prefs', testData);

    const retrieved = await StorageService.getItem('user_prefs');
    expect(retrieved).toBe(testData);
  });

  it('returns null fallback value if key does not exist', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const retrieved = await StorageService.getItem('non_existent_key');
    expect(retrieved).toBeNull();
  });

  it('handles AsyncStorage throwing an error during setItem without crashing', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Disk full or storage quota exceeded'));

    await expect(StorageService.setItem('any_key', 'val')).resolves.not.toThrow();
  });

  it('handles AsyncStorage throwing an error during removeItem without crashing', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Permission denied'));

    await expect(StorageService.removeItem('any_key')).resolves.not.toThrow();
  });
});
