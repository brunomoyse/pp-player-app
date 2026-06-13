import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDuration } from '@/utils/datetime';

export interface ClockLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number | null;
  isBreak: boolean;
}

export interface ClockDisplayProps {
  currentLevel: ClockLevel | null;
  nextLevel?: ClockLevel | null;
  timeRemaining: number;
  isLive?: boolean;
}

export function ClockDisplay({ currentLevel, nextLevel, timeRemaining, isLive }: ClockDisplayProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const onBreak = !!currentLevel?.isBreak;

  // Flash the clock briefly each time the blind level advances, so the change
  // is noticeable on a glanced-at screen. Keyed counter restarts the animation.
  const prevLevel = useRef<number | null>(null);
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    const lvl = currentLevel?.level ?? null;
    if (!reduce && lvl != null && prevLevel.current != null && lvl !== prevLevel.current) {
      setFlash((f) => f + 1);
    }
    prevLevel.current = lvl;
  }, [currentLevel?.level, reduce]);

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border bg-white/[0.02] p-5',
        isLive ? 'border-pp-danger' : 'border-pp-border'
      )}>
      {flash > 0 ? (
        <MotiView
          key={flash}
          pointerEvents="none"
          className="absolute inset-0 bg-pp-gold"
          from={{ opacity: 0.22 }}
          animate={{ opacity: 0 }}
          transition={{ type: 'timing', duration: 700 }}
        />
      ) : null}
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {isLive ? (
            <MotiView
              from={{ opacity: 1 }}
              animate={{ opacity: 0.4 }}
              transition={{ type: 'timing', duration: 1000, loop: true }}
              className="h-3 w-3 rounded-full bg-pp-danger"
            />
          ) : null}
          <Text className="font-display-bold text-[18px] text-pp-gold">
            {t('events.tournamentClock')}
          </Text>
        </View>
        <View
          className={cn(
            'rounded-full px-3 py-1.5',
            isLive ? 'bg-pp-danger' : 'border border-pp-border bg-white/10'
          )}>
          <Text className={cn('text-[12px] font-sans-semibold', isLive ? 'text-white' : 'text-pp-text')}>
            {t('events.level')} {currentLevel?.level ?? '-'}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View className="mb-4 flex-row gap-4">
        <View className="flex-1 items-center">
          <Text className="font-mono-medium text-[36px] text-pp-danger" style={{ fontVariant: ['tabular-nums'] }}>
            {formatDuration(timeRemaining)}
          </Text>
          <Text variant="muted" className="text-[11px] uppercase tracking-wide">
            {onBreak ? t('events.breakTime') : t('events.timeRemaining')}
          </Text>
        </View>

        {currentLevel && !onBreak ? (
          <View className="flex-1 items-center">
            <Text
              className="font-mono-medium text-[28px] text-pp-gold"
              style={{ fontVariant: ['tabular-nums'] }}>
              {currentLevel.smallBlind}
              <Text className="text-pp-text-muted"> / </Text>
              {currentLevel.bigBlind}
            </Text>
            <Text variant="muted" className="text-[11px] uppercase tracking-wide">
              {t('events.smallBigBlind')}
            </Text>
            {currentLevel.ante ? (
              <Text variant="muted" className="mt-0.5 font-mono text-[12px]">
                {t('events.ante')}: {currentLevel.ante}
              </Text>
            ) : null}
          </View>
        ) : onBreak ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[24px] font-sans-bold text-pp-gold-strong">{t('events.onBreak')}</Text>
          </View>
        ) : null}
      </View>

      {/* Footer — next level */}
      {nextLevel ? (
        <View className="flex-row items-center gap-2 rounded-lg bg-white/5 p-3">
          <Text variant="muted" className="text-[14px]">
            {t('events.nextLevel')}:
          </Text>
          {nextLevel.isBreak ? (
            <Text className="text-[14px] font-sans-semibold text-pp-gold-strong">
              {t('events.break')}
            </Text>
          ) : (
            <Text className="font-mono-medium text-[14px] text-pp-gold">
              {nextLevel.smallBlind}/{nextLevel.bigBlind}
              {nextLevel.ante ? (
                <Text variant="muted" className="text-[12px]">
                  {' '}
                  ({t('events.ante')}: {nextLevel.ante})
                </Text>
              ) : null}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}
