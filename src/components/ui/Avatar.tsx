import { Image } from 'expo-image';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
  /** gold ring around the avatar. */
  ring?: boolean;
  className?: string;
}

function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '').concat(parts[1]?.[0] ?? '').toUpperCase() || '?';
}

export function Avatar({ name, uri, size = 48, ring, className }: AvatarProps) {
  const fontSize = size * 0.4;
  return (
    <View
      className={cn(
        'items-center justify-center overflow-hidden rounded-full bg-pp-surface-2',
        ring && 'border-2 border-pp-gold',
        className
      )}
      style={{ width: size, height: size }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Text
          className="font-display-bold text-pp-gold"
          style={{ fontSize, lineHeight: fontSize * 1.15 }}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}
