import { MotiView } from 'moti';
import { type ReactNode } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { ppEasing, TIMING } from '@/lib/motion';

export interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  /** translateY offset to rise from (px). */
  y?: number;
  duration?: number;
  className?: string;
}

/** Fade + rise on mount (port of motion-v FadeUp). Honors reduced motion. */
export function FadeUp({ children, delay = 0, y = 24, duration = TIMING.normal, className }: FadeUpProps) {
  const reduce = useReducedMotion();
  return (
    <MotiView
      className={className}
      from={{ opacity: 0, translateY: reduce ? 0 : y }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: reduce ? 0 : duration, delay, easing: ppEasing }}>
      {children}
    </MotiView>
  );
}
