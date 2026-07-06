import type { AchievementTier } from '@/types/achievements';

import bronzeBurst from '@/assets/lottie/bronze-burst.json';
import goldBurst from '@/assets/lottie/gold-burst.json';
import silverBurst from '@/assets/lottie/silver-burst.json';

// The unlock burst is coloured by prestige tier — the achievement's own Ionicon
// (shown on the card) carries the per-achievement identity. Platinum/legendary
// have no dedicated art yet, so they reuse the closest existing tone; legendary
// additionally gets the holographic-foil treatment in the celebration card.
const BURST_BY_TIER: Record<AchievementTier, object> = {
  BRONZE: bronzeBurst,
  SILVER: silverBurst,
  GOLD: goldBurst,
  PLATINUM: silverBurst,
  LEGENDARY: goldBurst,
};

/** Resolve the tier-coloured Lottie burst, defaulting to gold. */
export function tierBurstSource(tier?: AchievementTier | null): object {
  return (tier && BURST_BY_TIER[tier]) || goldBurst;
}
