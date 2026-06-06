export interface ClubBreakdown {
  clubId: string;
  clubName: string;
  tournaments: number;
  buyinsCents: number;
  winningsCents: number;
  netCents: number;
}

export interface BuyInBreakdown {
  buyInCents: number;
  tournaments: number;
  buyinsCents: number;
  winningsCents: number;
  netCents: number;
}

export interface PnlPoint {
  day: string;
  netCents: number;
  cumulativeCents: number;
}

export interface ProAnalytics {
  byClub: ClubBreakdown[];
  byBuyIn: BuyInBreakdown[];
  cumulativePnl: PnlPoint[];
}
