import { View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './Text';

export type BadgeTone =
  | 'upcoming'
  | 'live'
  | 'completed'
  | 'deepstack'
  | 'turbo'
  | 'freezeout'
  | 'bounty'
  | 'neutral'
  | 'gold';

// bg / text class pairs — translucent fills like the web .pp-status-* / .pp-type-*.
const TONES: Record<BadgeTone, { bg: string; text: string }> = {
  upcoming: { bg: 'bg-pp-success/15', text: 'text-pp-success' },
  live: { bg: 'bg-pp-danger/15', text: 'text-pp-danger' },
  completed: { bg: 'bg-pp-surface-2', text: 'text-pp-text-muted' },
  deepstack: { bg: 'bg-pp-success/15', text: 'text-pp-success' },
  turbo: { bg: 'bg-pp-gold/15', text: 'text-pp-gold' },
  freezeout: { bg: 'bg-pp-surface-2', text: 'text-pp-text-muted' },
  bounty: { bg: 'bg-pp-danger/15', text: 'text-pp-danger' },
  neutral: { bg: 'bg-pp-surface-2', text: 'text-pp-text-muted' },
  gold: { bg: 'bg-pp-gold/15', text: 'text-pp-gold' },
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  className?: string;
  testID?: string;
}

export function Badge({ label, tone = 'neutral', className, testID }: BadgeProps) {
  const t = TONES[tone];
  return (
    <View testID={testID} className={cn('self-start rounded-full px-2.5 py-1', t.bg, className)}>
      <Text className={cn('font-sans-semibold text-[11px]', t.text)}>{label}</Text>
    </View>
  );
}
