import { useQuery } from '@apollo/client/react';

import { GET_FEATURE_FLAGS, type FeatureFlags } from '@/graphql/operations';

const DEFAULTS: FeatureFlags = {
  notes: false,
  proAccount: false,
  predictions: false,
  cosmetics: false,
  publicStats: false,
};

/**
 * Server-driven feature flags. Defaults to everything OFF until the query
 * resolves, so gated UI never flashes before the server confirms it is enabled.
 */
export function useFeatureFlags(): FeatureFlags {
  const { data } = useQuery(GET_FEATURE_FLAGS, { fetchPolicy: 'cache-first' });
  return data?.featureFlags ?? DEFAULTS;
}
