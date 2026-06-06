import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { colors } from '@/theme/tokens';
import type { AchievementTier, PlayerAchievement } from '@/types/achievements';

const TIER_COLOR: Record<AchievementTier, string> = {
  BRONZE: '#cd7f32',
  SILVER: '#c0c0c0',
  GOLD: colors.gold,
  PLATINUM: '#cfe0f5',
  LEGENDARY: '#a17fff',
};

function iconName(name?: string | null): keyof typeof Ionicons.glyphMap {
  return (name ?? 'ribbon-outline') as keyof typeof Ionicons.glyphMap;
}

export function AchievementCard({ item }: { item: PlayerAchievement }) {
  const { t } = useTranslation();
  const { achievement: a, isLocked, progress, unlockedAt } = item;
  const tier = a.tier ?? 'BRONZE';
  const threshold = a.thresholdValue ?? 0;
  const showProgress = isLocked && threshold > 1;
  const pct = threshold ? Math.min(Math.round((progress / threshold) * 100), 100) : 0;

  return (
    <Card
      highlighted={!isLocked && (tier === 'GOLD' || tier === 'PLATINUM' || tier === 'LEGENDARY')}
      className="flex-row gap-3">
      {/* Locked state = greyed icon + lock badge (never dim the whole card / text). */}
      <View className="relative h-12 w-12 items-center justify-center rounded-2xl border border-pp-border bg-white/5">
        <Ionicons name={iconName(a.icon)} size={24} color={isLocked ? colors.textDim : colors.gold} />
        {isLocked ? (
          <View className="absolute -bottom-1 -right-1 rounded-full bg-pp-bg p-0.5">
            <Ionicons name="lock-closed" size={13} color={colors.textDim} />
          </View>
        ) : null}
      </View>

      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 font-display-bold text-[15px] text-pp-text" numberOfLines={1}>
            {t(a.nameKey)}
          </Text>
          <Text
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: TIER_COLOR[tier] }}>
            {t(`achievements.tiers.${tier.toLowerCase()}`, tier)}
          </Text>
        </View>
        <Text variant="muted" className="text-[12px]">
          {t(a.descriptionKey)}
        </Text>

        {showProgress ? (
          <View className="mt-1 flex-row items-center gap-2">
            <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <View className="h-full rounded-full bg-pp-gold" style={{ width: `${pct}%` }} />
            </View>
            <Text variant="mono" className="text-[11px]">
              {Math.min(progress, threshold)}/{threshold}
            </Text>
          </View>
        ) : !isLocked && unlockedAt ? (
          <View className="mt-1 flex-row items-center gap-1.5">
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text className="text-[11px] text-pp-success">{t('achievements.unlocked', 'Unlocked')}</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
