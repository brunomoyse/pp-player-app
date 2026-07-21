export interface ClubBreakdown {
  clubId: string;
  clubName: string;
  tournaments: number;
  winningsCents: number;
}

export interface BuyInBreakdown {
  buyInCents: number;
  tournaments: number;
  winningsCents: number;
}

export interface ProAnalytics {
  byClub: ClubBreakdown[];
  byBuyIn: BuyInBreakdown[];
}
