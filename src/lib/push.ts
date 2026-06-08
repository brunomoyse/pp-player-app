import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { colors } from '@/theme/tokens';

// How the OS treats a push that arrives while the app is foregrounded. The
// in-app achievement celebration is driven separately by the WebSocket
// subscription (useAchievementNotifications), so a foreground banner here is
// purely the system surface — we still show it so behaviour is consistent
// whether the app is open or not.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ANDROID_CHANNEL_ID = 'default';

/**
 * The EAS project id is required by getExpoPushTokenAsync. It is injected into
 * the resolved config once `eas init` has run; until then (and in Expo Go /
 * web) we cannot mint a token, so registration no-ops gracefully.
 */
function getProjectId(): string | null {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null
  );
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Notifications',
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: colors.gold,
  });
}

export type PushPlatform = 'IOS' | 'ANDROID' | 'WEB';

export function currentPushPlatform(): PushPlatform {
  if (Platform.OS === 'ios') return 'IOS';
  if (Platform.OS === 'android') return 'ANDROID';
  return 'WEB';
}

/**
 * Request permission and obtain the Expo push token for this device.
 *
 * Returns null (and never throws) when push is unavailable: web, simulators,
 * Expo Go on Android (SDK 53+), denied permission, or a missing EAS projectId.
 * Callers should treat a null result as "no push on this device" and move on.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  // Push tokens only exist on physical hardware.
  if (!Device.isDevice) return null;

  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return null;

  const projectId = getProjectId();
  if (!projectId) {
    if (__DEV__) {
      console.warn(
        '[push] No EAS projectId in config — run `eas init` and rebuild to enable push tokens.'
      );
    }
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (e) {
    if (__DEV__) console.warn('[push] Failed to get Expo push token', e);
    return null;
  }
}

/** True when a notification payload represents an unlocked achievement. */
export function isAchievementNotification(
  content: Notifications.NotificationContent | undefined
): boolean {
  const data = content?.data as Record<string, unknown> | undefined;
  const type = data?.type ?? data?.notificationType;
  return type === 'ACHIEVEMENT_UNLOCKED';
}
