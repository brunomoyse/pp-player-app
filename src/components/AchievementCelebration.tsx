import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { ppEasing, ppSpring } from '@/lib/motion';
import { colors } from '@/theme/tokens';
import type { Achievement } from '@/types/achievements';

const CONFETTI_COLORS = [colors.gold, colors.goldStrong, colors.goldDeep, colors.text];
const PIECE_COUNT = 70;

function iconName(name?: string | null): keyof typeof Ionicons.glyphMap {
  return (name ?? 'ribbon-outline') as keyof typeof Ionicons.glyphMap;
}

interface Piece {
  dx: number;
  dy: number;
  rot: number;
  size: number;
  color: string;
  delay: number;
}

/** Deterministic-per-burst confetti config (regenerated each time `seed` changes). */
function buildPieces(seed: number, width: number, height: number): Piece[] {
  // Simple LCG so a given burst is stable across re-renders but varies per burst.
  let s = (seed * 9301 + 49297) % 233280 || 1;
  const next = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PIECE_COUNT + next() * 0.4;
    const dist = (0.4 + next() * 0.6) * Math.max(width, height) * 0.6;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - height * 0.15,
      rot: (next() - 0.5) * 720,
      size: 6 + Math.floor(next() * 6),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.floor(next() * 120),
    };
  });
}

export interface AchievementCelebrationProps {
  show: boolean;
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementCelebration({ show, achievement, onDismiss }: AchievementCelebrationProps) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [burst, setBurst] = useState(0);

  // New confetti burst each time the overlay opens (adjust-state-on-prop-change).
  const [wasShown, setWasShown] = useState(show);
  if (show !== wasShown) {
    setWasShown(show);
    if (show) setBurst((b) => b + 1);
  }

  const pieces = useMemo(
    () => (reduce ? [] : buildPieces(burst || 1, width, height)),
    [burst, reduce, width, height]
  );

  if (!achievement) return null;

  return (
    <Modal visible={show} transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      <Pressable
        onPress={onDismiss}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: 'rgba(10,10,12,0.72)' }}>
        {/* Confetti — emanates from the card centre. */}
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          {pieces.map((p, i) => (
            <MotiView
              key={`${burst}-${i}`}
              from={{ opacity: 1, translateX: 0, translateY: 0, rotate: '0deg' }}
              animate={{ opacity: 0, translateX: p.dx, translateY: p.dy, rotate: `${p.rot}deg` }}
              transition={{ type: 'timing', duration: 1100, delay: p.delay, easing: ppEasing }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size * 0.6,
                borderRadius: 1,
                backgroundColor: p.color,
              }}
            />
          ))}
        </View>

        {/* Card — stop propagation so taps inside don't dismiss. */}
        <Pressable onPress={() => {}}>
          <MotiView
            from={{ opacity: 0, scale: reduce ? 1 : 0.6, translateY: reduce ? 0 : 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={reduce ? { type: 'timing', duration: 200 } : ppSpring}
            className="w-full max-w-[320px] items-center rounded-2xl border bg-pp-surface px-6 pb-6 pt-8"
            style={{ borderColor: 'rgba(254,231,138,0.35)' }}>
            <LinearGradient
              colors={[colors.gold, colors.goldStrong]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
              <Ionicons name={iconName(achievement.icon)} size={34} color={colors.bg} />
            </LinearGradient>

            <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-pp-gold-deep">
              {t('achievements.unlockedTitle')}
            </Text>
            <Text variant="title" className="mt-1.5 text-center font-display-bold text-[22px]">
              {t(achievement.nameKey)}
            </Text>
            <Text variant="muted" className="mb-5 mt-2 text-center text-[13px]">
              {t(achievement.descriptionKey)}
            </Text>

            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              className="w-full items-center rounded-full bg-pp-gold py-3">
              <Text className="font-sans-semibold text-[14px] text-pp-bg">{t('common.nice')}</Text>
            </Pressable>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
