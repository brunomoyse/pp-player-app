import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme/tokens';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

const BG: Record<ButtonVariant, string> = {
  primary: 'bg-pp-gold',
  secondary: 'bg-pp-surface border border-pp-border',
  danger: 'bg-pp-danger',
  success: 'bg-pp-success',
};

const FG: Record<ButtonVariant, string> = {
  primary: 'text-pp-bg',
  secondary: 'text-pp-text',
  danger: 'text-white',
  success: 'text-pp-bg',
};

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  fullWidth,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      className={cn(
        'min-h-[44px] flex-row items-center justify-center rounded-full px-5',
        BG[variant],
        fullWidth && 'self-stretch',
        isDisabled && 'opacity-50',
        className
      )}
      style={({ pressed }) => ({ transform: [{ scale: pressed && !isDisabled ? 0.97 : 1 }] })}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'success' ? colors.bg : colors.text} />
      ) : (
        <Text className={cn('font-sans-semibold text-base', FG[variant])}>{title}</Text>
      )}
    </Pressable>
  );
}
