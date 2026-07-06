import { Canvas, Group, Skia, Skottie, useClock } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';

import burstSource from '@/assets/lottie/gold-burst.json';

export interface LottieBurstProps {
  /** Rendered square size in px. */
  size?: number;
  /** Loop the animation instead of playing it once. */
  loop?: boolean;
  /** Lottie document to play; defaults to the bundled gold burst. */
  source?: object;
}

/**
 * One-shot Lottie player built on Skia's bundled Skottie engine — no extra
 * native dependency. Drop any LottieFiles export in via `source`.
 *
 * Renders nothing when the Skottie engine or the Lottie document is
 * unavailable, so callers can layer it over an existing effect and degrade
 * gracefully rather than crash.
 */
export function LottieBurst({ size = 160, loop = false, source = burstSource }: LottieBurstProps) {
  const animation = useMemo(() => {
    try {
      return Skia.Skottie?.Make?.(JSON.stringify(source)) ?? null;
    } catch {
      return null;
    }
  }, [source]);

  const scale = useMemo(() => {
    if (!animation) return 1;
    const { width } = animation.size();
    return width ? size / width : 1;
  }, [animation, size]);

  const frame = useClock();
  const seek = useDerivedValue(() => {
    if (!animation) return 0;
    const fps = animation.fps();
    const total = animation.duration() * fps;
    const played = (frame.value / 1000) * fps;
    return loop ? played % total : Math.min(played, total - 1);
  }, [animation, loop]);

  if (!animation) return null;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Group transform={[{ scale }]}>
        <Skottie animation={animation} frame={seek} />
      </Group>
    </Canvas>
  );
}
