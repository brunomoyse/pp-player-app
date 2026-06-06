export interface PredictionBalance {
  balance: number;
  claimable: number;
}

export type PredictionStatus = 'open' | 'won' | 'lost';

export interface PredictionEntry {
  id: string;
  tournamentId: string;
  tournamentName: string;
  predictedWinnerName: string;
  stakePoints: number;
  status: PredictionStatus;
  payoutPoints: number;
  createdAt: string;
}
