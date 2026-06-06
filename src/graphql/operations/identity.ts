import { gql, type TypedDocumentNode } from '@apollo/client';

import type { RegisteredPlayer } from '@/types/identity';

export interface GetMyCrossClubProfileResult {
  myCrossClubProfile: RegisteredPlayer[];
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

export interface ClaimRegisteredPlayerResult {
  claimRegisteredPlayer: RegisteredPlayer;
}

export interface ClaimRegisteredPlayerVars {
  input: { registeredPlayerId: string };
}

/** Claim an unclaimed roster entry, linking it to the current app user. */
export const CLAIM_REGISTERED_PLAYER: TypedDocumentNode<
  ClaimRegisteredPlayerResult,
  ClaimRegisteredPlayerVars
> = gql`
  mutation ClaimRegisteredPlayer($input: ClaimRegisteredPlayerInput!) {
    claimRegisteredPlayer(input: $input) {
      id
      clubId
      displayName
      isClaimed
    }
  }
`;
