import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { tokens } from '@/lib/tokens';
import type { User } from '@/types/user';

export interface AuthState {
  currentUser: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Set after a successful login/register (Phase 3 wires the GraphQL calls).
  setSession: (user: User, accessToken: string, refreshToken?: string | null) => Promise<void>;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  // Restore tokens from secure storage on app boot.
  initialize: () => Promise<void>;
  // Local logout (clears state + secure store); server call added in Phase 3.
  clearSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      isLoading: false,
      error: null,

      setSession: async (user, accessToken, refreshToken) => {
        await tokens.setTokens(accessToken, refreshToken ?? undefined);
        set({ currentUser: user, accessToken, error: null });
      },

      setUser: (user) => set({ currentUser: user }),
      setAccessToken: (token) => set({ accessToken: token }),

      initialize: async () => {
        const token = await tokens.loadAccess();
        if (token) set({ accessToken: token });
      },

      clearSession: async () => {
        await tokens.clear();
        set({ currentUser: null, accessToken: null, error: null });
      },
    }),
    {
      name: 'pp-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Tokens live in secure-store, not AsyncStorage — only persist the profile.
      partialize: (s) => ({ currentUser: s.currentUser }),
    }
  )
);

/** True only when we have both a token and a profile. */
export const useIsAuthenticated = () =>
  useAuthStore((s) => !!s.accessToken && !!s.currentUser);
