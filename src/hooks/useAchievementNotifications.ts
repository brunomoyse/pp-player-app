import { useQuery, useSubscription } from '@apollo/client/react';
import { useEffect, useRef } from 'react';

import { GET_ACHIEVEMENTS_CATALOG, USER_NOTIFICATIONS } from '@/graphql/operations';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import type { Achievement } from '@/types/achievements';
import type { UserNotification } from '@/types/user';

/**
 * App-wide singleton: listens for achievement-unlock notifications over the
 * WebSocket and fires the celebration overlay. Mount once (root layout).
 *
 * The unlock notification references the achievement by code/id; we resolve it
 * against the cached catalog, falling back to a synthetic Achievement built from
 * the notification text so the celebration still fires if the catalog misses.
 */
export function useAchievementNotifications() {
  const isAuth = useIsAuthenticated();
  const trigger = useGamificationStore((s) => s.trigger);
  const lastId = useRef<string | null>(null);

  const { data: catalog } = useQuery(GET_ACHIEVEMENTS_CATALOG, { skip: !isAuth });
  const { data } = useSubscription(USER_NOTIFICATIONS, { skip: !isAuth });

  useEffect(() => {
    const note = data?.userNotifications;
    if (!note || note.notificationType !== 'ACHIEVEMENT_UNLOCKED') return;
    if (lastId.current === note.id) return;
    lastId.current = note.id;

    const achievement = resolveAchievement(note, catalog?.achievements ?? []);
    if (achievement) trigger(achievement);
  }, [data, catalog, trigger]);
}

function resolveAchievement(note: UserNotification, catalog: Achievement[]): Achievement | null {
  // The unlock payload carries the achievement code/id in one of the text fields.
  const needles = [note.message, note.title, note.tournamentId].filter(Boolean) as string[];
  const match = catalog.find((a) =>
    needles.some((n) => n === a.code || n === a.id || n.includes(a.code))
  );
  if (match) return match;

  // Fallback so the celebration still fires with the server-provided copy.
  return {
    id: note.id,
    code: 'unknown',
    nameKey: note.title,
    descriptionKey: note.message,
    category: 'MILESTONES',
    icon: 'trophy-outline',
    tier: 'GOLD',
    thresholdValue: 1,
  };
}
