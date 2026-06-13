import { MotiView } from 'moti';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { cn } from '@/lib/cn';

/**
 * Shimmering placeholder block. Loops a subtle opacity pulse (static under
 * reduced motion), mirroring the live-indicator pattern in ClockDisplay.
 * Compose with width/height/rounded classes to shape it.
 */
export function Skeleton({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <MotiView
      className={cn('rounded-xl bg-white/10', className)}
      from={{ opacity: 0.35 }}
      animate={{ opacity: reduce ? 0.35 : 0.7 }}
      transition={{
        type: 'timing',
        duration: 900,
        loop: reduce ? undefined : true,
        repeatReverse: true,
      }}
    />
  );
}

/** Card-shaped placeholder matching list rows (tournament / achievement cards). */
export function SkeletonCard() {
  return (
    <View className="rounded-2xl border border-pp-border bg-pp-surface p-4">
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </View>
      </View>
    </View>
  );
}

/** A column of skeleton cards for list loading states. */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
