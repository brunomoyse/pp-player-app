import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { TFunction } from 'i18next';

import type { Achievement } from '@/types/achievements';
import type { Club, User } from '@/types/user';

// The pp-video Remotion render service. No production deployment exists yet, so
// outside dev the feature is disabled entirely unless the env var is set —
// never fall back to localhost in a store build.
const RENDER_BASE_URL =
  process.env.EXPO_PUBLIC_RENDER_BASE_URL ?? (__DEV__ ? 'http://localhost:4000' : null);

/** Whether a render service is configured; gates the share-video UI. */
export const isVideoShareAvailable = RENDER_BASE_URL != null;

/**
 * The props contract of the pp-video `AchievementUnlock` composition. JSON only,
 * so it POSTs straight to the render service.
 */
export interface AchievementVideoProps {
  title: string;
  description: string;
  tier: string;
  emblem: string;
  statLine?: string;
  playerHandle: string;
  clubName: string;
}

/**
 * Resolve an unlocked achievement (plus the current player/club context) into
 * the render props. The localized title/description come from i18n, exactly as
 * the celebration card shows them; tier is lowercased to match the composition's
 * enum, and `icon` (an Ionicon name) is passed straight through as the emblem.
 */
export function buildVideoProps(
  achievement: Achievement,
  t: TFunction,
  user: User | null,
  club: Club | null
): AchievementVideoProps {
  const handle = user?.username ?? user?.firstName ?? 'player';
  return {
    title: t(achievement.nameKey),
    description: t(achievement.descriptionKey),
    tier: (achievement.tier ?? 'GOLD').toLowerCase(),
    emblem: achievement.icon ?? 'ribbon-outline',
    playerHandle: handle.startsWith('@') ? handle : `@${handle}`,
    clubName: club?.name ?? 'PocketPair',
  };
}

/**
 * Render the achievement card to an MP4 (server-side, cached by props), download
 * it locally, and open the native share sheet. Returns false if the platform has
 * no share capability.
 */
export async function shareAchievementVideo(props: AchievementVideoProps): Promise<boolean> {
  if (RENDER_BASE_URL == null) return false;
  if (!(await Sharing.isAvailableAsync())) return false;

  const res = await fetch(`${RENDER_BASE_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(props),
  });
  if (!res.ok) throw new Error(`Render service responded ${res.status}`);

  const { url } = (await res.json()) as { url: string };

  // The OS share sheet needs a local file, not a remote URL.
  const target = `${FileSystem.cacheDirectory}achievement-${Date.now()}.mp4`;
  const { uri } = await FileSystem.downloadAsync(url, target);

  await Sharing.shareAsync(uri, {
    mimeType: 'video/mp4',
    dialogTitle: 'Share your achievement',
    UTI: 'public.mpeg-4',
  });
  return true;
}
