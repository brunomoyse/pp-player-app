import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ClaimedCardWallet } from '@/types/drinkWallet';

/**
 * The backend exposes no "my wallets" query — the only way to learn a walletId
 * is the `claimCard` response. So we persist claimed wallet IDs locally and
 * re-query each one's balance on the drink-wallet screen.
 */
export interface DrinkWalletState {
  claimedWallets: ClaimedCardWallet[];
  /** Add or replace a claimed wallet (deduped by id). */
  addClaimedWallet: (wallet: ClaimedCardWallet) => void;
  removeClaimedWallet: (id: string) => void;
}

export const useDrinkWalletStore = create<DrinkWalletState>()(
  persist(
    (set) => ({
      claimedWallets: [],
      addClaimedWallet: (wallet) =>
        set((s) => ({
          claimedWallets: [...s.claimedWallets.filter((w) => w.id !== wallet.id), wallet],
        })),
      removeClaimedWallet: (id) =>
        set((s) => ({ claimedWallets: s.claimedWallets.filter((w) => w.id !== id) })),
    }),
    {
      name: 'pp-drink-wallets',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ claimedWallets: s.claimedWallets }),
    }
  )
);
