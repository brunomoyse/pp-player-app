import { MotiPressable } from 'moti/interactions';
import { useMemo, type ReactNode } from 'react';

import { ppSpring } from '@/lib/motion';

export interface PressableProps {
  children: ReactNode;
  onPress?: () => void;
  /** scale while pressed. */
  scale?: number;
  disabled?: boolean;
  className?: string;
}

/** Spring press-scale feedback (port of motion-v Pressable). */
export function Pressable({ children, onPress, scale = 0.97, disabled, className }: PressableProps) {
  return (
    <MotiPressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      // @ts-expect-error moti forwards className via NativeWind
      className={className}
      animate={useMemo(
        () =>
          ({ pressed }: { pressed: boolean }) => {
            'worklet';
            return { scale: pressed ? scale : 1 };
          },
        [scale]
      )}
      transition={ppSpring}>
      {children}
    </MotiPressable>
  );
}
