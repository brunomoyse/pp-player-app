import { useApolloClient } from '@apollo/client/react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import {
  REGISTER_DEVICE_TOKEN,
  UNREGISTER_DEVICE_TOKEN,
} from '@/graphql/operations/notifications';
import {
  currentPushPlatform,
  isAchievementNotification,
  registerForPushNotificationsAsync,
} from '@/lib/push';
import { useIsAuthenticated } from '@/stores/useAuthStore';

/**
 * App-wide singleton (mount once in the root layout): manages the device's
 * Expo push token and routes taps on achievement-unlock pushes.
 *
 * - On sign-in: request permission, mint the Expo push token, and register it
 *   with the backend so the server can target this device.
 * - On sign-out: best-effort unregister so a shared device stops receiving the
 *   previous user's pushes.
 * - On tap (foreground, background, or cold start): deep-link to the
 *   achievements screen when the push is an achievement unlock.
 *
 * Everything is best-effort: push is unavailable on web, simulators, in Expo Go
 * (SDK 53+), or before `eas init`, in which case registration silently no-ops.
 */
export function usePushNotifications() {
  const isAuth = useIsAuthenticated();
  const apollo = useApolloClient();
  const registeredToken = useRef<string | null>(null);

  // Register / unregister this device's push token as auth state flips.
  useEffect(() => {
    let cancelled = false;

    async function register() {
      const token = await registerForPushNotificationsAsync();
      if (cancelled || !token || registeredToken.current === token) return;
      try {
        await apollo.mutate({
          mutation: REGISTER_DEVICE_TOKEN,
          variables: { input: { token, platform: currentPushPlatform() } },
        });
        registeredToken.current = token;
      } catch (e) {
        if (__DEV__) console.warn('[push] registerDeviceToken failed', e);
      }
    }

    async function unregister() {
      const token = registeredToken.current;
      registeredToken.current = null;
      if (!token) return;
      try {
        await apollo.mutate({ mutation: UNREGISTER_DEVICE_TOKEN, variables: { token } });
      } catch (e) {
        if (__DEV__) console.warn('[push] unregisterDeviceToken failed', e);
      }
    }

    if (isAuth) void register();
    else void unregister();

    return () => {
      cancelled = true;
    };
  }, [isAuth, apollo]);

  // Route taps on achievement pushes to the achievements screen. Covers the
  // warm path (app running) and the cold path (tapped while terminated).
  useEffect(() => {
    function handle(response: Notifications.NotificationResponse | null) {
      if (!response) return;
      if (isAchievementNotification(response.notification.request.content)) {
        router.push('/achievements');
      }
    }

    void Notifications.getLastNotificationResponseAsync().then(handle);
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, []);
}
