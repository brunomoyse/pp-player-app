import { create } from 'zustand';

import type { Tournament } from '@/types/tournament';

// Lightweight cache for the currently-open tournament detail (not persisted) —
// mirrors pp-mobile's useTournamentStore so the detail screen renders instantly.
export interface TournamentState {
  selected: Tournament | null;
  setSelected: (t: Tournament | null) => void;
  clear: () => void;
}

export const useTournamentStore = create<TournamentState>((set) => ({
  selected: null,
  setSelected: (t) => set({ selected: t }),
  clear: () => set({ selected: null }),
}));
