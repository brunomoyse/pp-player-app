import { type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

export interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
  edges?: Edge[];
}

export function Screen({
  children,
  scroll = true,
  className,
  contentClassName,
  edges = ['top'],
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn('p-4 gap-4', contentClassName)}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View className={cn('flex-1 p-4', contentClassName)}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-pp-bg', className)}>
      {body}
    </SafeAreaView>
  );
}
