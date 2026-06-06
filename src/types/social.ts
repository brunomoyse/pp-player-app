export interface Rivalry {
  opponentId: string;
  opponentName: string;
  meetings: number;
  wins: number;
  losses: number;
}

export interface MutualFlame {
  sharedNights: number;
  lastShared: string | null;
  alive: boolean;
}

export interface Friend {
  friendshipId: string;
  userId: string;
  name: string;
  status: string;
  isIncoming: boolean;
  flame?: MutualFlame;
}

export interface YearInPoker {
  year: number;
  tournaments: number;
  buyinsCents: number;
  winningsCents: number;
  netCents: number;
  itmCount: number;
  bestFinish: number | null;
  checkIns: number;
  longestStreak: number;
  favoriteClub: string | null;
  nemesisName: string | null;
}
