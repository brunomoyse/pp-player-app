import { gql, type TypedDocumentNode } from '@apollo/client';

import type { ProAnalytics } from '@/types/analytics';

export interface GetMyProAnalyticsResult {
  myProAnalytics: ProAnalytics;
}

/** Personal performance analytics. */
export const GET_MY_PRO_ANALYTICS: TypedDocumentNode<
  GetMyProAnalyticsResult,
  Record<string, never>
> = gql`
  query GetMyProAnalytics {
    myProAnalytics {
      byClub {
        clubId
        clubName
        tournaments
        winningsCents
      }
      byBuyIn {
        buyInCents
        tournaments
        winningsCents
      }
    }
  }
`;
