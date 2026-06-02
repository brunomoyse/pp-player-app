import { Children, isValidElement, type ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { FadeUp } from './FadeUp';

export interface StaggerProps {
  children: ReactNode;
  /** delay step between children (ms). */
  stagger?: number;
  /** delay before the first child (ms). */
  initialDelay?: number;
  y?: number;
  className?: string;
}

/** Reveals children one after another (port of motion-v Stagger). */
export function Stagger({ children, stagger = 60, initialDelay = 20, y = 16, className }: StaggerProps) {
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View className={cn(className)}>
      {items.map((child, i) => (
        <FadeUp key={i} delay={initialDelay + i * stagger} y={y}>
          {child}
        </FadeUp>
      ))}
    </View>
  );
}
