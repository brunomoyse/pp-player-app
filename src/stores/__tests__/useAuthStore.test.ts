/* eslint-disable import/first -- jest.mock() must be hoisted above the imports it replaces */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

// Replace the store's outbound collaborators so we test the store's own logic
// (session wiring, single-flight refresh, sign-out) in isolation.
jest.mock('@/graphql/client', () => ({
  apolloClient: {
    mutate: jest.fn(),
    query: jest.fn(),
    clearStore: jest.fn(async () => undefined),
  },
}));
jest.mock('@/lib/tokens', () => ({
  tokens: {
    getAccess: jest.fn(() => null),
    loadAccess: jest.fn(async () => null),
    getRefresh: jest.fn(async () => null),
    setTokens: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
  },
}));
jest.mock('@/lib/push', () => ({
  getRegisteredPushToken: jest.fn(() => null),
  setRegisteredPushToken: jest.fn(),
}));

import { apolloClient } from '@/graphql/client';
import { getRegisteredPushToken } from '@/lib/push';
import { tokens } from '@/lib/tokens';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/user';

type AnyMock = jest.Mock<(...args: any[]) => any>;
const mutate = apolloClient.mutate as unknown as AnyMock;
const query = apolloClient.query as unknown as AnyMock;
const clearStore = apolloClient.clearStore as unknown as AnyMock;
const getAccess = tokens.getAccess as unknown as AnyMock;
const loadAccess = tokens.loadAccess as unknown as AnyMock;
const getRefresh = tokens.getRefresh as unknown as AnyMock;
const setTokens = tokens.setTokens as unknown as AnyMock;
const clear = tokens.clear as unknown as AnyMock;
const pushToken = getRegisteredPushToken as unknown as AnyMock;

const USER: User = {
  id: 'u1',
  email: 'p@x.io',
  firstName: 'P',
  lastName: 'X',
  role: 'PLAYER',
  isActive: true,
};

function okRefresh() {
  return {
    ok: true,
    json: async () => ({ token: 'new-access', refresh_token: 'new-refresh' }),
  } as Response;
}

describe('useAuthStore', () => {
  let fetchSpy: AnyMock;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchSpy = jest.spyOn(global, 'fetch') as unknown as AnyMock;
    fetchSpy.mockResolvedValue(okRefresh());
    useAuthStore.setState({ currentUser: null, accessToken: null, isLoading: false, error: null });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('stores the session on a successful mutation', async () => {
      mutate.mockResolvedValue({
        data: { loginUser: { token: 'access-1', user: USER, refreshToken: 'refresh-1' } },
      });

      const user = await useAuthStore.getState().login({ email: 'p@x.io', password: 'pw' });

      expect(user).toEqual(USER);
      expect(setTokens).toHaveBeenCalledWith('access-1', 'refresh-1');
      const s = useAuthStore.getState();
      expect(s.currentUser).toEqual(USER);
      expect(s.accessToken).toBe('access-1');
      expect(s.error).toBeNull();
      // nativeClient must be forced on so the backend returns the refresh token.
      expect(mutate.mock.calls[0][0].variables.input.nativeClient).toBe(true);
    });

    it('sets an error and returns null when credentials are rejected', async () => {
      mutate.mockResolvedValue({ data: { loginUser: null } });

      const user = await useAuthStore.getState().login({ email: 'p@x.io', password: 'bad' });

      expect(user).toBeNull();
      expect(useAuthStore.getState().error).toBe('Invalid credentials');
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(setTokens).not.toHaveBeenCalled();
    });

    it('captures a thrown error message and returns null', async () => {
      mutate.mockRejectedValue(new Error('network boom'));

      const user = await useAuthStore.getState().login({ email: 'p@x.io', password: 'pw' });

      expect(user).toBeNull();
      expect(useAuthStore.getState().error).toBe('network boom');
    });
  });

  describe('refreshAccessToken (single-flight)', () => {
    it('shares one in-flight refresh across concurrent callers', async () => {
      getRefresh.mockResolvedValue('refresh-tok');

      const [a, b] = await Promise.all([
        useAuthStore.getState().refreshAccessToken(),
        useAuthStore.getState().refreshAccessToken(),
      ]);

      expect(a).toBe(true);
      expect(b).toBe(true);
      // The headline property: two concurrent refreshes hit the network ONCE.
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(setTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
      expect(useAuthStore.getState().accessToken).toBe('new-access');
    });

    it('returns false without a refresh token and never hits the network', async () => {
      getRefresh.mockResolvedValue(null);

      const ok = await useAuthStore.getState().refreshAccessToken();

      expect(ok).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns false on a non-ok response', async () => {
      getRefresh.mockResolvedValue('refresh-tok');
      fetchSpy.mockResolvedValue({ ok: false, json: async () => ({}) } as Response);

      const ok = await useAuthStore.getState().refreshAccessToken();

      expect(ok).toBe(false);
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it('clears the in-flight guard so a later refresh can run again', async () => {
      getRefresh.mockResolvedValue('refresh-tok');

      await useAuthStore.getState().refreshAccessToken();
      await useAuthStore.getState().refreshAccessToken();

      // Sequential (not concurrent) calls each perform their own fetch.
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('clears the session and resets the Apollo cache', async () => {
      useAuthStore.setState({ currentUser: USER, accessToken: 'access-1' });
      pushToken.mockReturnValue(null);

      await useAuthStore.getState().logout();

      expect(clear).toHaveBeenCalled();
      expect(clearStore).toHaveBeenCalled();
      const s = useAuthStore.getState();
      expect(s.currentUser).toBeNull();
      expect(s.accessToken).toBeNull();
    });
  });

  describe('initialize', () => {
    it('does nothing when no access token is stored', async () => {
      loadAccess.mockResolvedValue(null);

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('refreshes at launch when a refresh token exists', async () => {
      loadAccess.mockResolvedValue('stored-access');
      getRefresh.mockResolvedValue('refresh-tok');
      getAccess.mockReturnValue('new-access');
      query.mockResolvedValue({ data: { me: USER } });

      await useAuthStore.getState().initialize();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState().accessToken).toBe('new-access');
    });
  });
});
