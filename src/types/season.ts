export interface Season {
  id: string;
  clubId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface SeasonPass {
  seasonId: string;
  xp: number;
  tier: number;
  xpIntoTier: number;
  xpPerTier: number;
}

export interface QuestProgress {
  code: string;
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  xpReward: number;
}

export interface HallOfFameEntry {
  seasonId: string;
  seasonName: string;
  endsAt: string;
  championName: string;
  events: number;
}
