import { create } from 'zustand';

interface ConnectionState {
  /** True when the subscription socket dropped unexpectedly and is retrying. */
  wsDown: boolean;
  setWsDown: (down: boolean) => void;
}

/** Drives the ConnectionBanner so live data is never silently stale. */
export const useConnectionStore = create<ConnectionState>((set) => ({
  wsDown: false,
  setWsDown: (down) => set({ wsDown: down }),
}));
