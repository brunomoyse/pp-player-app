import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Club } from '@/types/user';

export interface ClubState {
  selectedClub: Club | null;
  clubs: Club[];
  setSelectedClub: (club: Club | null) => void;
  setClubs: (clubs: Club[]) => void;
}

export const useClubStore = create<ClubState>()(
  persist(
    (set, get) => ({
      selectedClub: null,
      clubs: [],
      setSelectedClub: (club) => set({ selectedClub: club }),
      setClubs: (clubs) => {
        // Auto-select the first club if none is chosen yet (mirrors the web app).
        const current = get().selectedClub;
        const stillValid = current && clubs.some((c) => c.id === current.id);
        set({ clubs, selectedClub: stillValid ? current : (clubs[0] ?? null) });
      },
    }),
    {
      name: 'pp-club',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ selectedClub: s.selectedClub }),
    }
  )
);
