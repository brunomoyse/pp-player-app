import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}

/** Filter chip — gold when active, muted surface when not. */
export function Chip({ label, active, onPress, className }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      className={cn(
        'rounded-full border px-3 py-1.5',
        active ? 'border-pp-gold bg-pp-gold' : 'border-pp-border bg-white/5',
        className
      )}>
      <Text className={cn('text-[13px] font-sans-medium', active ? 'text-pp-bg' : 'text-pp-text-muted')}>
        {label}
      </Text>
    </Pressable>
  );
}
