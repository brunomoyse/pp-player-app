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

/**
 * The blinds share the clock body with a fixed-width timer, leaving them roughly
 * 190pt. At 28px JetBrains Mono that is about 11 characters, so a late level
 * ("25000 / 50000 (5000)") used to wrap mid-number — the big blind dropped onto
 * a second line. Step the size down by length, and let the platform shrink
 * further on narrow devices.
 */
const BLIND_SIZE_STEPS: readonly (readonly [maxChars: number, fontSize: number])[] = [
  [11, 28],
  [13, 24],
  [17, 19],
  [21, 15],
] as const;

function blindsFontSize(text: string): number {
  for (const [maxChars, fontSize] of BLIND_SIZE_STEPS) {
    if (text.length <= maxChars) return fontSize;
  }
  return 13;
}

/** "1000 / 2000", or "1000 / 2000 (200)" with an ante — bare parens for the ante
 *  matches how the structure list already writes a level. */
function formatBlinds(level: ClockLevel): string {
  const base = `${level.smallBlind} / ${level.bigBlind}`;
  return level.ante ? `${base} (${level.ante})` : base;
}

export function ClockDisplay({ currentLevel, nextLevel, timeRemaining, isLive }: ClockDisplayProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const onBreak = !!currentLevel?.isBreak;
  const blinds = currentLevel ? formatBlinds(currentLevel) : '';

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
        {/* The timer is fixed-width ("MM:SS"), so it sizes to content and hands the
            rest of the row to the blinds, which are what actually overflow. With
            no level to show alongside it, it stretches so it stays centred. */}
        <View className={cn('items-center', currentLevel ? undefined : 'flex-1')}>
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
              className="font-mono-medium text-pp-gold"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              style={{ fontSize: blindsFontSize(blinds), fontVariant: ['tabular-nums'] }}>
              {blinds}
            </Text>
            <Text variant="muted" className="text-[11px] uppercase tracking-wide">
              {currentLevel.ante ? t('events.blindsAnte') : t('events.smallBigBlind')}
            </Text>
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
