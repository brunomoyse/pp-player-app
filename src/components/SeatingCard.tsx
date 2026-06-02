import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/tokens';

function formatChips(chips: number): string {
  if (chips >= 1_000_000) return `${(chips / 1_000_000).toFixed(1)}M`;
  if (chips >= 1_000) return `${(chips / 1_000).toFixed(1)}K`;
  return chips.toString();
}

export interface SeatingCardProps {
  tableNumber: number;
  seatNumber: number;
  playerName?: string;
  chipStack?: number;
  isCurrentUser?: boolean;
  actions?: ReactNode;
}

export function SeatingCard({
  tableNumber,
  seatNumber,
  playerName,
  chipStack,
  isCurrentUser,
  actions,
}: SeatingCardProps) {
  const { t } = useTranslation();

  return (
    <View
      className={cn(
        'rounded-xl border p-4',
        isCurrentUser ? 'border-pp-gold bg-pp-gold/10' : 'border-pp-border bg-white/[0.02]'
      )}>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Text className="font-sans-semibold text-[16px] text-pp-gold">
            {t('events.table')} {tableNumber}
          </Text>
          <Text variant="muted" className="text-[14px]">
            {t('events.seat')} {seatNumber}
          </Text>
        </View>
        {isCurrentUser ? (
          <View className="flex-row items-center gap-1 rounded-xl bg-pp-gold/20 px-2.5 py-1">
            <Ionicons name="person" size={12} color={colors.gold} />
            <Text className="text-[11px] font-sans-semibold uppercase tracking-wide text-pp-gold">
              {t('seating.you')}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="min-h-[60px] justify-center">
        {playerName ? (
          <View className="flex-row items-center gap-3">
            <Avatar name={playerName} size={48} ring={isCurrentUser} />
            <View className="flex-1">
              <Text className="font-sans-semibold text-[15px] text-pp-text" numberOfLines={1}>
                {playerName}
              </Text>
              {chipStack !== undefined ? (
                <Text className="text-[13px] font-sans-semibold text-pp-success">
                  {formatChips(chipStack)} {t('seating.chips')}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-center gap-2 py-2">
            <Ionicons name="remove-circle-outline" size={22} color={colors.textMuted} />
            <Text variant="muted" className="text-[14px]">
              {t('seating.empty')}
            </Text>
          </View>
        )}
      </View>

      {actions ? <View className="mt-3 border-t border-pp-border pt-3">{actions}</View> : null}
    </View>
  );
}
