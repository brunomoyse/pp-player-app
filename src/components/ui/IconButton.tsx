import { Ionicons } from '@expo/vector-icons';
import { Pressable, type PressableProps } from 'react-native';

import { colors } from '@/theme/tokens';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style' | 'hitSlop'> {
  name: IconName;
  /** accessibilityLabel is required — an icon-only control is invisible to screen readers without it. */
  accessibilityLabel: string;
  size?: number;
  color?: string;
  /** Extra tap area added around the icon. Default 12 keeps even a 22pt icon ≥ 44pt. */
  hitSlop?: number;
}

/**
 * Icon-only tappable. Centralizes the three things every icon button must get right:
 * a 44pt-minimum tap target (via hitSlop), a screen-reader label, and platform-correct
 * press feedback (scale on iOS, borderless ripple on Android).
 */
export function IconButton({
  name,
  accessibilityLabel,
  size = 24,
  color = colors.textMuted,
  hitSlop = 12,
  disabled,
  ...rest
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={hitSlop}
      disabled={disabled}
      android_ripple={disabled ? undefined : { color: 'rgba(255,255,255,0.12)', borderless: true }}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : 1,
        transform: [{ scale: pressed && !disabled ? 0.92 : 1 }],
      })}
      {...rest}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}
