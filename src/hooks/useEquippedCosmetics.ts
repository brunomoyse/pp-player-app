import { useQuery } from '@apollo/client/react';

import { GET_MY_COSMETICS } from '@/graphql/operations';
import type { CosmeticItem } from '@/types/cosmetics';

import { useFeatureFlags } from './useFeatureFlags';

export interface EquippedCosmetics {
  avatarFrame?: CosmeticItem;
  badge?: CosmeticItem;
}

/**
 * The current user's equipped cosmetics, indexed by kind. Skips the query
 * entirely when the cosmetics feature is off, so nothing renders (or fetches)
 * until the server confirms the flag is enabled.
 */
export function useEquippedCosmetics(): EquippedCosmetics {
  const flags = useFeatureFlags();
  const { data } = useQuery(GET_MY_COSMETICS, { skip: !flags.cosmetics });

  if (!flags.cosmetics) return {};
  const equipped = (data?.myCosmetics ?? []).filter((c) => c.equipped);
  return {
    avatarFrame: equipped.find((c) => c.kind === 'avatar_frame'),
    badge: equipped.find((c) => c.kind === 'badge'),
  };
}
