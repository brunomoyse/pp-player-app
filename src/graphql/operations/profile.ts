import { gql, type TypedDocumentNode } from '@apollo/client';

import type { PlayerProfile } from '@/types/social';

export interface GetPlayerProfileResult {
  playerProfile: PlayerProfile;
}
export interface GetPlayerProfileVars {
  userId: string;
}

/** A player's public profile — identity, lifetime stats, unlocked achievements
 *  and recent finishes — reachable from the leaderboard. */
export const GET_PLAYER_PROFILE: TypedDocumentNode<
  GetPlayerProfileResult,
  GetPlayerProfileVars
> = gql`
  query GetPlayerProfile($userId: ID!) {
    playerProfile(userId: $userId) {
      id
      name
      friendship
      friendshipId
      statistics {
        totalItm
        totalTournaments
        totalWinnings
        totalBuyIns
        itmPercentage
        roiPercentage
      }
      recentResults {
        result {
          id
          finalPosition
          prizeCents
          points
        }
        tournament {
          id
          title
          startTime
          buyInCents
        }
      }
      achievements {
        id
        progress
        unlockedAt
        isLocked
        achievement {
          id
          code
          nameKey
          descriptionKey
          category
          icon
          tier
          thresholdValue
        }
      }
    }
  }
`;
