import { gql, type TypedDocumentNode } from '@apollo/client';

import type { ClaimedCardWallet, DrinkWallet } from '@/types/drinkWallet';

export interface GetDrinkWalletResult {
  drinkWallet: DrinkWallet | null;
}
export interface GetDrinkWalletVars {
  walletId: string;
}

/** Owner-readable wallet: cached balance + recent ledger entries (newest first). */
export const GET_DRINK_WALLET: TypedDocumentNode<GetDrinkWalletResult, GetDrinkWalletVars> = gql`
  query GetDrinkWallet($walletId: ID!) {
    drinkWallet(walletId: $walletId) {
      id
      clubId
      registeredPlayerId
      balance
      createdAt
      recentEntries {
        id
        walletId
        delta
        reason
        tournamentId
        expiresAt
        createdAt
      }
    }
  }
`;

export interface ClaimCardResult {
  claimCard: {
    wallet: ClaimedCardWallet;
    message: string;
  };
}
export interface ClaimCardVars {
  credentialToken: string;
}

/** Bind the authenticated player as owner of a card's wallet. Idempotent / safe to retry. */
export const CLAIM_CARD: TypedDocumentNode<ClaimCardResult, ClaimCardVars> = gql`
  mutation ClaimCard($credentialToken: String!) {
    claimCard(input: { credentialToken: $credentialToken }) {
      wallet {
        id
        clubId
        balance
      }
      message
    }
  }
`;
