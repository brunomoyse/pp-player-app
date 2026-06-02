import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// JWT storage. Access token is also held in-memory so the Apollo auth link can
// read it synchronously on every request. On native, tokens live in the device
// keychain/keystore (expo-secure-store); on web (used only for dev preview)
// SecureStore is unavailable, so fall back to AsyncStorage/localStorage.
const ACCESS_KEY = 'pp_access_token';
const REFRESH_KEY = 'pp_refresh_token';
const isWeb = Platform.OS === 'web';

const storage = {
  get: (k: string) => (isWeb ? AsyncStorage.getItem(k) : SecureStore.getItemAsync(k)),
  set: (k: string, v: string) => (isWeb ? AsyncStorage.setItem(k, v) : SecureStore.setItemAsync(k, v)),
  del: (k: string) => (isWeb ? AsyncStorage.removeItem(k) : SecureStore.deleteItemAsync(k)),
};

let accessInMemory: string | null = null;

export const tokens = {
  getAccess(): string | null {
    return accessInMemory;
  },
  async loadAccess(): Promise<string | null> {
    accessInMemory = await storage.get(ACCESS_KEY);
    return accessInMemory;
  },
  async getRefresh(): Promise<string | null> {
    return storage.get(REFRESH_KEY);
  },
  async setTokens(access: string, refresh?: string | null): Promise<void> {
    accessInMemory = access;
    await storage.set(ACCESS_KEY, access);
    if (refresh != null) {
      await storage.set(REFRESH_KEY, refresh);
    }
  },
  async clear(): Promise<void> {
    accessInMemory = null;
    await storage.del(ACCESS_KEY);
    await storage.del(REFRESH_KEY);
  },
};
