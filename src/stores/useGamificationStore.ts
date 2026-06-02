import { create } from 'zustand';

import type { Achievement } from '@/types/achievements';

interface GamificationState {
  celebration: Achievement | null;
  show: boolean;
  /** Queue an unlock celebration (replaces any in-flight one). */
  trigger: (achievement: Achievement) => void;
  dismiss: () => void;
}

/** App-wide gamification state — drives the AchievementCelebration overlay mounted in the root layout. */
export const useGamificationStore = create<GamificationState>((set) => ({
  celebration: null,
  show: false,
  trigger: (achievement) => set({ celebration: achievement, show: true }),
  // Keep `celebration` mounted through the exit animation; only flip `show`.
  dismiss: () => set({ show: false }),
}));
