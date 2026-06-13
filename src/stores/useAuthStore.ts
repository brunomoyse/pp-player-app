import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { setAuthActions } from '@/graphql/authActions';
import { apolloClient } from '@/graphql/client';
import { GET_ME, LOGIN_USER, REGISTER_USER } from '@/graphql/operations/auth';
import { UNREGISTER_DEVICE_TOKEN } from '@/graphql/operations/notifications';
import { getRegisteredPushToken, setRegisteredPushToken } from '@/lib/push';
import { tokens } from '@/lib/tokens';
import type { User, UserLoginInput, UserRegistrationInput } from '@/types/user';

const AUTH_BASE = process.env.EXPO_PUBLIC_AUTH_BASE_URL ?? 'http://localhost:8080';
// Access tokens last ~15 min; refresh a minute early.
const REFRESH_AFTER_MS = 14 * 60 * 1000;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
// Single-flight guard: concurrent 401s (or a timer firing mid-request) must
// share one in-flight refresh, otherwise parallel rotations invalidate each
// other and cascade into a forced sign-out.
let refreshInFlight: Promise<boolean> | null = null;

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
          // nativeClient: true → backend returns the refresh token in the body
          // (no cookie jar on native); we persist it in the keychain below.
          const { data } = await apolloClient.mutate({
            mutation: LOGIN_USER,
            variables: { input: { ...input, nativeClient: true } },
          });
          const payload = data?.loginUser;
          if (payload?.token && payload.user) {
            await get().setSession(payload.user, payload.token, payload.refreshToken);
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

      // Native refresh: present the keychain-stored refresh token via the
      // X-Refresh-Token header (no cookie jar on native). The backend rotates
      // the token and returns the new one in the JSON body, which we persist.
      refreshAccessToken: async () => {
        if (refreshInFlight) return refreshInFlight;
        refreshInFlight = (async () => {
          try {
            const refresh = await tokens.getRefresh();
            if (!refresh) return false;
            const res = await fetch(`${AUTH_BASE}/auth/refresh`, {
              method: 'POST',
              headers: { 'X-Refresh-Token': refresh },
            });
            if (!res.ok) return false;
            // Body is serde-serialized (snake_case): { token, refresh_token }.
            const json = (await res.json()) as { token?: string; refresh_token?: string };
            if (!json.token) return false;
            // Persist the rotated refresh token; fall back to the current one if
            // the backend omitted it (shouldn't happen for native callers).
            await tokens.setTokens(json.token, json.refresh_token ?? refresh);
            set({ accessToken: json.token });
            scheduleRefresh();
            return true;
          } catch {
            return false;
          } finally {
            refreshInFlight = null;
          }
        })();
        return refreshInFlight;
      },

      logout: async () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        // Drop this device's push token while the session is still valid — the
        // mutation needs auth, so it must run before clearSession().
        const pushToken = getRegisteredPushToken();
        if (pushToken) {
          setRegisteredPushToken(null);
          try {
            await apolloClient.mutate({
              mutation: UNREGISTER_DEVICE_TOKEN,
              variables: { token: pushToken },
            });
          } catch {
            // best-effort; the token is reassigned on next login regardless
          }
        }
        try {
          // Present the refresh token so the backend revokes the whole family
          // (native has no cookie for the server to read).
          const refresh = await tokens.getRefresh();
          await fetch(`${AUTH_BASE}/auth/logout`, {
            method: 'POST',
            headers: refresh ? { 'X-Refresh-Token': refresh } : undefined,
          });
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
        if (!token) return;
        set({ accessToken: token });
        // Renew the access token at launch if a refresh token exists, so one
        // that expired while the app was closed is fresh before any query
        // fires. On failure (offline / revoked) we keep the stored token — the
        // Apollo error link refreshes or signs out on the first hard 401.
        const refresh = await tokens.getRefresh();
        if (refresh) {
          await get().refreshAccessToken();
        } else {
          scheduleRefresh();
        }
        void get().fetchMe();
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

// Let the Apollo error link trigger refresh / sign-out without importing the
// store (breaks the useAuthStore → client → links → useAuthStore require cycle).
setAuthActions({
  refresh: () => useAuthStore.getState().refreshAccessToken(),
  signOut: () => useAuthStore.getState().clearSession(),
});

export const useIsAuthenticated = () =>
  useAuthStore((s) => !!s.accessToken && !!s.currentUser);
