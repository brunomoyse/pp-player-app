import { gql, type TypedDocumentNode } from '@apollo/client';

import type { PredictionBalance, PredictionEntry } from '@/types/prediction';

export interface GetMyPredictionBalanceResult {
  myPredictionBalance: PredictionBalance;
}

/** The current user's earned-only Prediction-Points balance + claimable amount. */
export const GET_MY_PREDICTION_BALANCE: TypedDocumentNode<
  GetMyPredictionBalanceResult,
  Record<string, never>
> = gql`
  query GetMyPredictionBalance {
    myPredictionBalance {
      balance
      claimable
    }
  }
`;

export interface GetMyPredictionsResult {
  myPredictions: PredictionEntry[];
}

/** The current user's fantasy predictions, newest first. */
export const GET_MY_PREDICTIONS: TypedDocumentNode<
  GetMyPredictionsResult,
  Record<string, never>
> = gql`
  query GetMyPredictions {
    myPredictions {
      id
      tournamentId
      tournamentName
      predictedWinnerName
      stakePoints
      status
      payoutPoints
      createdAt
    }
  }
`;

export interface ClaimPredictionPointsResult {
  claimPredictionPoints: PredictionBalance;
}

/** Claim earned points (attendance/play) + the one-time welcome seed. */
export const CLAIM_PREDICTION_POINTS: TypedDocumentNode<
  ClaimPredictionPointsResult,
  Record<string, never>
> = gql`
  mutation ClaimPredictionPoints {
    claimPredictionPoints {
      balance
      claimable
    }
  }
`;

export interface CreatePredictionResult {
  createPrediction: PredictionEntry;
}
export interface CreatePredictionVars {
  tournamentId: string;
  predictedWinnerUserId: string;
  stakePoints: number;
}

/** Place a free fantasy pick on a tournament winner, staking prediction points. */
export const CREATE_PREDICTION: TypedDocumentNode<
  CreatePredictionResult,
  CreatePredictionVars
> = gql`
  mutation CreatePrediction(
    $tournamentId: ID!
    $predictedWinnerUserId: ID!
    $stakePoints: Int!
  ) {
    createPrediction(
      tournamentId: $tournamentId
      predictedWinnerUserId: $predictedWinnerUserId
      stakePoints: $stakePoints
    ) {
      id
      tournamentId
      tournamentName
      predictedWinnerName
      stakePoints
      status
      payoutPoints
      createdAt
    }
  }
`;
