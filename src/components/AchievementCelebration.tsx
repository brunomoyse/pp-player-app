import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { HolographicFoil } from '@/components/HolographicFoil';
import { Text } from '@/components/ui';
import { buildVideoProps, shareAchievementVideo } from '@/lib/achievementVideo';
import { ppEasing, ppSpring } from '@/lib/motion';
import { LEGENDARY_SOUND, UNLOCK_SOUND } from '@/lib/sounds';
import { useAuthStore } from '@/stores/useAuthStore';
import { useClubStore } from '@/stores/useClubStore';
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

  const user = useAuthStore((s) => s.currentUser);
  const club = useClubStore((s) => s.selectedClub);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);

  async function onShare() {
    if (!achievement || sharing) return;
    setShareError(false);
    setSharing(true);
    try {
      const ok = await shareAchievementVideo(buildVideoProps(achievement, t, user, club));
      if (!ok) setShareError(true);
    } catch {
      setShareError(true);
    } finally {
      setSharing(false);
    }
  }

  const isLegendary = achievement?.tier === 'LEGENDARY';
  const sound = isLegendary ? LEGENDARY_SOUND : UNLOCK_SOUND;
  const player = useAudioPlayer(sound);

  // Fire haptics (and sound, once an asset is bundled) as the card appears.
  useEffect(() => {
    if (!show) return;
    if (isLegendary) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (sound != null) {
      player.seekTo(0);
      player.play();
    }
  }, [show, isLegendary, sound, player]);

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
    <Modal
      visible={show}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
      accessibilityViewIsModal>
      <Pressable
        onPress={onDismiss}
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: isLegendary ? 'rgba(6,6,8,0.9)' : 'rgba(10,10,12,0.72)' }}>
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
            {isLegendary ? (
              <View
                style={{
                  width: 104,
                  height: 104,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                <View style={{ position: 'absolute' }}>
                  <HolographicFoil size={104} animate={!reduce} />
                </View>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(8,8,10,0.55)',
                  }}>
                  <Ionicons name={iconName(achievement.icon)} size={34} color={colors.text} />
                </View>
              </View>
            ) : (
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
            )}

            <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-pp-gold-deep">
              {t('achievements.unlockedTitle')}
            </Text>
            <Text variant="title" className="mt-1.5 text-center font-display-bold text-[22px]">
              {t(achievement.nameKey)}
            </Text>
            <Text variant="muted" className="mb-5 mt-2 text-center text-[13px]">
              {t(achievement.descriptionKey)}
            </Text>

            <View className="w-full gap-2.5">
              <Pressable
                onPress={onShare}
                disabled={sharing}
                accessibilityRole="button"
                className="w-full flex-row items-center justify-center gap-2 rounded-full bg-pp-gold py-3"
                style={{ opacity: sharing ? 0.7 : 1 }}>
                {sharing ? (
                  <ActivityIndicator size="small" color={colors.bg} />
                ) : (
                  <Ionicons name="share-outline" size={18} color={colors.bg} />
                )}
                <Text className="font-sans-semibold text-[14px] text-pp-bg">
                  {sharing ? t('achievements.preparingShare') : t('achievements.shareVideo')}
                </Text>
              </Pressable>

              {shareError ? (
                <Text className="text-center text-[12px] text-red-400">
                  {t('achievements.shareError')}
                </Text>
              ) : null}

              <Pressable onPress={onDismiss} accessibilityRole="button" className="w-full items-center py-2">
                <Text variant="caption">
                  {t('common.nice')}
                </Text>
              </Pressable>
            </View>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
