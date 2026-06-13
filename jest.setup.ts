// Jest setup (jest-expo preset). Keep global test scaffolding here.
// `__DEV__` is provided by the jest-expo preset.
import { jest } from '@jest/globals';

// AsyncStorage backs the zustand persisted auth store. The real native module
// isn't available under jest, so swap in a minimal in-memory implementation that
// satisfies createJSONStorage's getItem/setItem/removeItem contract.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: jest.fn(async (key: string) => {
        store.delete(key);
      }),
      clear: jest.fn(async () => {
        store.clear();
      }),
    },
  };
});
