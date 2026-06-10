import { gql, type TypedDocumentNode } from '@apollo/client';

import type { ClubPlayer } from '@/types/identity';

export interface GetMyCrossClubProfileResult {
  myCrossClubProfile: ClubPlayer[];
}

/** The current user's roster entries across every club — the cross-club profile. */
export const GET_MY_CROSS_CLUB_PROFILE: TypedDocumentNode<
  GetMyCrossClubProfileResult,
  Record<string, never>
> = gql`
  query GetMyCrossClubProfile {
    myCrossClubProfile {
      id
      clubId
      displayName
      isClaimed
      club {
        id
        name
        city
      }
    }
  }
`;

export interface ClaimClubPlayerResult {
  claimClubPlayer: ClubPlayer;
}

export interface ClaimClubPlayerVars {
  input: { clubPlayerId: string };
}

/** Claim an unclaimed roster entry, linking it to the current app user. */
export const CLAIM_REGISTERED_PLAYER: TypedDocumentNode<
  ClaimClubPlayerResult,
  ClaimClubPlayerVars
> = gql`
  mutation ClaimClubPlayer($input: ClaimClubPlayerInput!) {
    claimClubPlayer(input: $input) {
      id
      clubId
      displayName
      isClaimed
    }
  }
`;
