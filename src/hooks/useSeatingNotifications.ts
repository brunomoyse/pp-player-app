import { useSubscription } from '@apollo/client/react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { USER_NOTIFICATIONS } from '@/graphql/operations';
import { toast } from '@/lib/toast';
import { useIsAuthenticated } from '@/stores/useAuthStore';

/**
 * App-wide singleton: surfaces seating events (seat assigned, table change,
 * elimination) as toasts while the app is open. Backgrounded delivery is
 * covered by the matching Expo pushes. Mount once (root layout).
 */
export function useSeatingNotifications() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const lastId = useRef<string | null>(null);

  const { data } = useSubscription(USER_NOTIFICATIONS, { skip: !isAuth });

  useEffect(() => {
    const note = data?.userNotifications;
    if (!note || lastId.current === note.id) return;

    // Copy is rebuilt client-side so it follows the app locale; the server
    // message is English-only.
    switch (note.notificationType) {
      case 'SEAT_ASSIGNED':
        lastId.current = note.id;
        toast.success(t('notifications.seatAssigned'));
        break;
      case 'PLAYER_MOVED':
        lastId.current = note.id;
        toast.info(t('notifications.playerMoved'));
        break;
      case 'PLAYER_ELIMINATED':
        lastId.current = note.id;
        toast.error(t('notifications.eliminated'));
        break;
      default:
        break;
    }
  }, [data, t]);
}
