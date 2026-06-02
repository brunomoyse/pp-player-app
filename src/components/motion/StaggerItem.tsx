import { type ReactNode } from 'react';
import { View } from 'react-native';

/** Optional wrapper for a single Stagger child (the animation is applied by
 * the parent Stagger). Kept for API parity with the web app. */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={className}>{children}</View>;
}
