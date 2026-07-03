import { forwardRef, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme/tokens';

import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, onFocus, onBlur, accessibilityLabel, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-1.5">
      {label ? (
        <Text variant="label" className="text-pp-text-muted">
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          'rounded-xl border bg-pp-surface-2 px-4 py-3 font-sans text-base text-pp-text',
          error ? 'border-pp-danger' : focused ? 'border-pp-gold' : 'border-pp-border-strong',
          className
        )}
        {...rest}
      />
      {error ? (
        <Text className="text-xs text-pp-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
