/**
 * Drink wallet — a club-scoped ledger of drink *credits* (integer counts, not money).
 * Players can only link a printed card (`claimCard`) and read their balance/history;
 * top-ups and bar redemptions are manager-operated on the backend.
 */
export type DrinkLedgerReason =
  | 'TournamentTopup'
  | 'BarRedemption'
  | 'Expiry'
  | 'Adjustment'
  | 'Transfer';

export interface DrinkLedgerEntry {
  id: string;
  walletId: string;
  /** Positive for credit lots, negative for debits (redemption/expiry). */
  delta: number;
  reason: DrinkLedgerReason;
  tournamentId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface DrinkWallet {
  id: string;
  clubId: string;
  clubPlayerId: string | null;
  balance: number;
  createdAt: string;
  recentEntries: DrinkLedgerEntry[];
}

/** Slim wallet shape returned by `claimCard` and persisted locally. */
export interface ClaimedCardWallet {
  id: string;
  clubId: string;
  balance: number;
}
