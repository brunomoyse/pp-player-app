import type { Club } from './user';

/**
 * A club roster entry. Exists for everyone a club registers, whether or not they
 * are an app user yet. One app user maps to many registered players (one per
 * club) — that fan-out is the cross-club profile.
 */
export interface RegisteredPlayer {
  id: string;
  clubId: string;
  displayName: string;
  appUserId?: string | null;
  isClaimed: boolean;
  club?: Club | null;
}
