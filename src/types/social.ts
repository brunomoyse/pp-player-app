import type { PlayerAchievement } from '@/types/achievements';
import type { PlayerStatistics, UserTournamentResult } from '@/types/tournament';

export interface MutualFlame {
  sharedNights: number;
  lastShared: string | null;
  alive: boolean;
}

/** The viewer's relationship to a profile they're looking at. */
export type ProfileFriendship =
  | 'MYSELF'
  | 'NONE'
  | 'REQUEST_SENT'
  | 'REQUEST_RECEIVED'
  | 'FRIENDS';

export interface PlayerProfile {
  id: string;
  name: string;
  statistics: PlayerStatistics;
  recentResults: UserTournamentResult[];
  achievements: PlayerAchievement[];
  friendship: ProfileFriendship;
  friendshipId?: string | null;
}

export interface Friend {
  friendshipId: string;
  userId: string;
  name: string;
  status: string;
  isIncoming: boolean;
  iCanRegisterThem: boolean;
  canRegisterMe: boolean;
  flame?: MutualFlame;
}

export interface YearInPoker {
  year: number;
  tournaments: number;
  winningsCents: number;
  itmCount: number;
  bestFinish: number | null;
  checkIns: number;
  longestStreak: number;
  favoriteClub: string | null;
  nemesisName: string | null;
}
