import { Easing } from 'react-native-reanimated';

import { EASING, SPRING, TIMING } from '@/theme/tokens';

export { EASING, SPRING, TIMING };

/** Shared ease-out curve (port of pp-mobile's [0.16, 1, 0.3, 1]). */
export const ppEasing = Easing.bezier(EASING[0], EASING[1], EASING[2], EASING[3]);

export const ppSpring = {
  type: 'spring' as const,
  stiffness: SPRING.stiffness,
  damping: SPRING.damping,
  mass: SPRING.mass,
};

export function timing(duration: number = TIMING.normal, delay = 0) {
  return { type: 'timing' as const, duration, delay, easing: ppEasing };
}
