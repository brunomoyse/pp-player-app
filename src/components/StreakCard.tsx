import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Card, Text } from '@/components/ui';
import { GET_MY_ATTENDANCE_STREAK } from '@/graphql/operations';
import { colors } from '@/theme/tokens';

/**
 * Attendance streak: the player's consecutive-event flame. Free, earned-only —
 * never purchasable (constraint G1). Backed by `myAttendanceStreak`.
 */
export function StreakCard() {
  const { t } = useTranslation();
  const { data, loading } = useQuery(GET_MY_ATTENDANCE_STREAK);
  const streak = data?.myAttendanceStreak;
  const current = streak?.currentStreak ?? 0;
  const lit = current > 0;
  const reduce = useReducedMotion();
  const pulse = lit && !reduce;

  if (!streak && loading) {
    return (
      <Card>
        <Text variant="dim">
          {t('common.loading')}
        </Text>
      </Card>
    );
  }

  return (
    <Card className="gap-3">
      <Text variant="label" className="text-pp-gold-deep">
        {t('streak.title')}
      </Text>

      <View className="flex-row items-center gap-3">
        <MotiView
          from={{ scale: reduce ? 1 : 0.9, opacity: reduce ? 1 : 0.6 }}
          animate={{ scale: pulse ? [1, 1.08, 1] : 1, opacity: 1 }}
          transition={{ type: 'timing', duration: 1400, loop: pulse }}
          className="h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
          <Ionicons name="flame" size={28} color={lit ? colors.gold : colors.textDim} />
        </MotiView>

        <View className="flex-1">
          <Text variant="title">
            {t('streak.days', { count: current })}
          </Text>
          <Text variant="dim">
            {current === 0
              ? t('streak.empty')
              : t('streak.best', { count: streak?.longestStreak ?? 0 })}
          </Text>
        </View>

        {/* Streak freezes — earned forgiveness for a missed week. */}
        <View className="items-center gap-1">
          <View className="flex-row gap-1">
            {Array.from({ length: 2 }).map((_, i) => (
              <Ionicons
                key={i}
                name="snow"
                size={16}
                color={i < (streak?.freezesAvailable ?? 0) ? colors.goldStrong : colors.border}
              />
            ))}
          </View>
          <Text variant="dim" className="text-[10px]">
            {t('streak.freezes')}
          </Text>
        </View>
      </View>
    </Card>
  );
}
