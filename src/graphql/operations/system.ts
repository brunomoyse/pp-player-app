import { gql, type TypedDocumentNode } from '@apollo/client';

export interface FeatureFlags {
  notes: boolean;
  proAccount: boolean;
  cosmetics: boolean;
  publicStats: boolean;
}

export interface GetFeatureFlagsResult {
  featureFlags: FeatureFlags;
}

/** Which optional features are enabled on the server, so the app can hide gated UI. */
export const GET_FEATURE_FLAGS: TypedDocumentNode<
  GetFeatureFlagsResult,
  Record<string, never>
> = gql`
  query GetFeatureFlags {
    featureFlags {
      notes
      proAccount
      cosmetics
      publicStats
    }
  }
`;
