import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Secure storage helper using expo-secure-store on mobile
 * with graceful in-memory/localStorage fallback for web/dev.
 */
class SecureStorageService {
  private memoryStore = new Map<string, string>();

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        } else {
          this.memoryStore.set(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn(`[SecureStorage] Failed to set item for key: ${key}`, error);
      this.memoryStore.set(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return this.memoryStore.get(key) || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn(`[SecureStorage] Failed to get item for key: ${key}`, error);
      return this.memoryStore.get(key) || null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        this.memoryStore.delete(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn(`[SecureStorage] Failed to remove item for key: ${key}`, error);
      this.memoryStore.delete(key);
    }
  }

  async clearAll(keys: string[]): Promise<void> {
    await Promise.all(keys.map(k => this.removeItem(k)));
  }
}

export const secureStorage = new SecureStorageService();
