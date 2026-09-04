import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme/tokens';

import { Avatar } from './Avatar';
import { Text } from './Text';

export interface FacePileProps {
  /** Names to draw, in display order. Rendered as initials — the schema has no photos. */
  names: (string | null | undefined)[];
  /**
   * Total people represented. Anything beyond the drawn faces becomes a "+N"
   * chip. Defaults to `names.length`, so a caller that already sliced the list
   * must pass the true total or the overflow disappears.
   */
  total?: number;
  /** Faces drawn before overflowing into "+N". */
  max?: number;
  size?: number;
  /**
   * Cut-out ring separating overlapping faces. Should match whatever the pile
   * sits on, so it reads as a gap rather than a border.
   */
  ringColor?: string;
  className?: string;
}

export function FacePile({
  names,
  total,
  max = 5,
  size = 32,
  ringColor = colors.bg,
  className,
}: FacePileProps) {
  const shown = names.slice(0, max);
  const overflow = Math.max(0, (total ?? names.length) - shown.length);
  // Faces tuck under their left neighbour by a third of their width.
  const overlap = -Math.round(size / 3);

  if (shown.length === 0) return null;

  return (
    <View className={cn('flex-row items-center', className)}>
      {shown.map((name, i) => (
        <View
          key={`${name ?? '?'}-${i}`}
          // Later faces sit on top, so the stack reads left-to-right.
          style={{ marginLeft: i === 0 ? 0 : overlap, zIndex: i }}>
          <Avatar name={name} size={size} ringColor={ringColor} />
        </View>
      ))}
      {overflow > 0 ? (
        <View
          className="items-center justify-center rounded-full bg-pp-surface-2"
          style={{
            width: size,
            height: size,
            marginLeft: overlap,
            zIndex: shown.length,
            borderWidth: 2,
            borderColor: ringColor,
          }}>
          <Text
            className="font-sans-semibold text-pp-text-muted"
            style={{ fontSize: size * 0.32 }}>
            +{overflow}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
