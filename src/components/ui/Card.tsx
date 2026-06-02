import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

export interface CardProps extends ViewProps {
  children: ReactNode;
  /** gold-bordered + glow emphasis (e.g. unlocked / featured). */
  highlighted?: boolean;
  className?: string;
}

export function Card({ children, highlighted, className, style, ...rest }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-2xl border bg-pp-surface p-4',
        highlighted ? 'border-pp-gold/40' : 'border-pp-border',
        className
      )}
      style={[
        {
          shadowColor: highlighted ? '#fee78a' : '#000',
          shadowOpacity: highlighted ? 0.18 : 0.4,
          shadowRadius: highlighted ? 24 : 20,
          shadowOffset: { width: 0, height: highlighted ? 8 : 12 },
          elevation: 6,
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}
