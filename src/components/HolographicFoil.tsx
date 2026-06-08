import { Canvas, Circle, LinearGradient, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Rainbow loop (first === last) so the sweep wraps seamlessly.
const HOLO_COLORS = ['#ff5f6d', '#ffc371', '#47e891', '#3ad0ff', '#a17fff', '#ff5f6d'];

/**
 * A holographic-foil disc rendered with Skia: a rainbow linear gradient whose
 * endpoints orbit the centre, producing the shifting-foil shimmer used on the
 * legendary achievement-unlock card. Falls back to a static sweep when
 * `animate` is false (reduced motion).
 */
export function HolographicFoil({ size = 96, animate = true }: { size?: number; animate?: boolean }) {
  const r = size / 2;
  const phase = useSharedValue(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (animate && !reduce) {
      phase.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false);
    }
  }, [animate, reduce, phase]);

  const start = useDerivedValue(() => {
    const a = phase.value * Math.PI * 2;
    return vec(r + Math.cos(a) * r, r + Math.sin(a) * r);
  });
  const end = useDerivedValue(() => {
    const a = phase.value * Math.PI * 2;
    return vec(r - Math.cos(a) * r, r - Math.sin(a) * r);
  });

  return (
    <Canvas style={{ width: size, height: size }}>
      <Circle cx={r} cy={r} r={r}>
        <LinearGradient start={start} end={end} colors={HOLO_COLORS} />
      </Circle>
    </Canvas>
  );
}
