import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { apolloClient } from '@/graphql/client';
import { GET_ME, LOGIN_USER, REGISTER_USER } from '@/graphql/operations/auth';
import { tokens } from '@/lib/tokens';
import type { User, UserLoginInput, UserRegistrationInput } from '@/types/user';

const AUTH_BASE = process.env.EXPO_PUBLIC_AUTH_BASE_URL ?? 'http://localhost:8080';
// Access tokens last ~15 min; refresh a minute early.
const REFRESH_AFTER_MS = 14 * 60 * 1000;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export interface AuthState {
  currentUser: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (input: UserLoginInput) => Promise<User | null>;
  register: (input: UserRegistrationInput) => Promise<User | null>;
  fetchMe: () => Promise<User | null>;
  refreshAccessToken: () => Promise<boolean>;
  logout: () => Promise<void>;

  setSession: (user: User, accessToken: string, refreshToken?: string | null) => Promise<void>;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  initialize: () => Promise<void>;
  clearSession: () => Promise<void>;
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    void useAuthStore.getState().refreshAccessToken();
  }, REFRESH_AFTER_MS);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accessToken: null,
      isLoading: false,
      error: null,

      login: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apolloClient.mutate({ mutation: LOGIN_USER, variables: { input } });
          const payload = data?.loginUser;
          if (payload?.token && payload.user) {
            await get().setSession(payload.user, payload.token);
            scheduleRefresh();
            return payload.user;
          }
          set({ error: 'Invalid credentials' });
          return null;
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Login failed' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apolloClient.mutate({
            mutation: REGISTER_USER,
            variables: { input },
          });
          if (!data?.registerUser) {
            set({ error: 'Registration failed' });
            return null;
          }
          // registerUser returns no token — log in with the same credentials.
          return await get().login({ email: input.email, password: input.password });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'Registration failed' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMe: async () => {
        if (!tokens.getAccess()) return null;
        try {
          const { data } = await apolloClient.query({ query: GET_ME, fetchPolicy: 'network-only' });
          if (data?.me) {
            set({ currentUser: data.me });
            return data.me;
          }
          return null;
        } catch {
          return null;
        }
      },

      // Refresh token is returned in the JSON body for native clients (pp-service
      // change tracked in the plan); we send the stored refresh token back.
      refreshAccessToken: async () => {
        try {
          const refresh = await tokens.getRefresh();
          const res = await fetch(`${AUTH_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(refresh ? { refreshToken: refresh } : {}),
            credentials: 'include',
          });
          if (!res.ok) return false;
          const json = (await res.json()) as { token?: string; refreshToken?: string };
          if (!json.token) return false;
          await tokens.setTokens(json.token, json.refreshToken);
          set({ accessToken: json.token });
          scheduleRefresh();
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        try {
          await fetch(`${AUTH_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch {
          // best-effort
        }
        await get().clearSession();
        await apolloClient.clearStore();
      },

      setSession: async (user, accessToken, refreshToken) => {
        await tokens.setTokens(accessToken, refreshToken ?? undefined);
        set({ currentUser: user, accessToken, error: null });
      },
      setUser: (user) => set({ currentUser: user }),
      setAccessToken: (token) => set({ accessToken: token }),

      initialize: async () => {
        const token = await tokens.loadAccess();
        if (token) {
          set({ accessToken: token });
          scheduleRefresh();
          void get().fetchMe();
        }
      },

      clearSession: async () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        await tokens.clear();
        set({ currentUser: null, accessToken: null, error: null });
      },
    }),
    {
      name: 'pp-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ currentUser: s.currentUser }),
    }
  )
);

export const useIsAuthenticated = () =>
  useAuthStore((s) => !!s.accessToken && !!s.currentUser);
