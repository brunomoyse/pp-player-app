import { useApolloClient } from '@apollo/client/react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { REGISTER_DEVICE_TOKEN } from '@/graphql/operations/notifications';
import i18n from '@/i18n';
import {
  announcementNotificationTournamentId,
  currentPushPlatform,
  getPushPermissionStatus,
  isAchievementNotification,
  isAnnouncementNotification,
  registerForPushNotificationsAsync,
  seatingNotificationTournamentId,
  setRegisteredPushToken,
} from '@/lib/push';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { useNotificationPrimerStore } from '@/stores/useNotificationPrimerStore';

/**
 * App-wide singleton (mount once in the root layout): manages the device's
 * Expo push token and routes taps on achievement-unlock pushes.
 *
 * - On sign-in: request permission, mint the Expo push token, and register it
 *   with the backend so the server can target this device. The token is also
 *   stashed at module scope so the auth store can unregister it on logout while
 *   the session is still valid (see useAuthStore.logout).
 * - On sign-out: the local token ref is cleared so the next user re-registers;
 *   the backend unregister itself is owned by logout().
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

  // Register this device's push token whenever a session is active.
  useEffect(() => {
    let cancelled = false;

    if (!isAuth) {
      registeredToken.current = null;
      setRegisteredPushToken(null);
      return;
    }

    // Mint the Expo token (prompting the OS only if permission isn't yet
    // granted) and register it with the backend.
    async function mintAndRegister() {
      const token = await registerForPushNotificationsAsync();
      if (cancelled || !token || registeredToken.current === token) return;
      try {
        await apollo.mutate({
          mutation: REGISTER_DEVICE_TOKEN,
          variables: {
            input: { token, platform: currentPushPlatform(), locale: i18n.language },
          },
        });
        registeredToken.current = token;
        setRegisteredPushToken(token);
      } catch (e) {
        if (__DEV__) console.warn('[push] registerDeviceToken failed', e);
      }
    }

    async function register() {
      const status = await getPushPermissionStatus();
      if (cancelled) return;
      if (status === 'granted') {
        // Already allowed — register silently, no dialog.
        await mintAndRegister();
      } else if (status === 'undetermined') {
        // Never asked yet: show our rationale first; only prompt the OS once the
        // person taps "Enable" (Responsibility: explain why before asking).
        useNotificationPrimerStore.getState().open(() => {
          void mintAndRegister();
        });
      }
      // 'denied' → respect the choice; don't nag.
    }

    void register();

    return () => {
      cancelled = true;
    };
  }, [isAuth, apollo]);

  // Route push taps: achievements → achievements screen, seating events →
  // the tournament. Covers the warm path (app running) and the cold path
  // (tapped while terminated).
  useEffect(() => {
    function handle(response: Notifications.NotificationResponse | null) {
      if (!response) return;
      const content = response.notification.request.content;
      const tournamentId = seatingNotificationTournamentId(content);
      if (tournamentId) {
        router.push(`/tournament/${tournamentId}`);
        return;
      }
      if (isAnnouncementNotification(content)) {
        const announcementTournamentId = announcementNotificationTournamentId(content);
        if (announcementTournamentId) {
          router.push(`/tournament/${announcementTournamentId}`);
        } else {
          router.push('/announcements');
        }
        return;
      }
      if (isAchievementNotification(content)) {
        router.push('/achievements');
      }
    }

    void Notifications.getLastNotificationResponseAsync().then(handle);
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, []);
}
