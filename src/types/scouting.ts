export interface PrivacySettings {
  shareNamedPl: boolean;
  inScoutingPool: boolean;
}

export interface ScoutingMatch {
  userId: string;
  handle: string;
}

export interface ScoutingProfile {
  userId: string;
  handle: string;
  tournaments: number;
  itmPercentage: number;
  bestFinish: number | null;
}

export interface ScoutingQuota {
  used: number;
  limit: number;
  unlimited: boolean;
}
