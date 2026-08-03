import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Emits `<prefix>-<value>` testIDs. Segment labels ("Upcoming", "Live", …)
   * repeat as status badges elsewhere on the same screen, so e2e flows need an
   * unambiguous handle on the control itself. */
  testIDPrefix?: string;
}

/** Segmented control — the selected segment is a solid gold pill with dark,
 * legible text (carries over the contrast fix from the web app). */
export function Segment<T extends string>({
  options,
  value,
  onChange,
  className,
  testIDPrefix,
}: SegmentProps<T>) {
  return (
    <View className={cn('flex-row rounded-xl bg-white/5 p-1', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            testID={testIDPrefix ? `${testIDPrefix}-${opt.value}` : undefined}
            onPress={() => onChange(opt.value)}
            className={cn('flex-1 items-center rounded-lg px-2 py-2', active && 'bg-pp-gold')}>
            <Text
              numberOfLines={1}
              className={cn(
                'text-[13px] font-sans-medium',
                active ? 'text-pp-bg' : 'text-pp-text-muted'
              )}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
