import { create } from 'zustand';

/**
 * Drives the pre-permission rationale modal (NotificationPrimer, mounted in the
 * root layout). usePushNotifications opens it with an `onEnable` thunk that runs
 * the real OS permission request + token registration; the modal stays a dumb
 * presentational component. `dismissed` is kept for the session so a "Not now"
 * choice isn't re-prompted on every navigation.
 */
interface NotificationPrimerState {
  visible: boolean;
  dismissed: boolean;
  onEnable: (() => void) | null;
  open: (onEnable: () => void) => void;
  close: () => void;
}

export const useNotificationPrimerStore = create<NotificationPrimerState>((set, get) => ({
  visible: false,
  dismissed: false,
  onEnable: null,
  open: (onEnable) => {
    if (get().dismissed) return;
    set({ visible: true, onEnable });
  },
  close: () => set({ visible: false, dismissed: true, onEnable: null }),
}));
