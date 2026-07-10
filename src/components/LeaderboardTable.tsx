import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Pressable, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Avatar, Card, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { ppEasing } from '@/lib/motion';
import type { LeaderboardEntry } from '@/types/tournament';

function fullName(e: LeaderboardEntry): string {
  return e.displayName || (e.user?.username ?? ([e.user?.firstName, e.user?.lastName].filter(Boolean).join(' ') || '-'));
}

function rankColor(rank: number): string {
  if (rank === 1) return 'text-pp-gold';
  if (rank === 2) return 'text-pp-text-muted';
  if (rank === 3) return 'text-pp-gold-deep';
  return 'text-pp-text-dim';
}

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string | null;
  // Winnings (not net profit): showing losses on a public board discourages play.
  metric?: 'points' | 'winnings' | 'volume';
}

export function LeaderboardTable({ entries, currentUserId, metric = 'points' }: LeaderboardTableProps) {
  const value = (e: LeaderboardEntry) => {
    if (metric === 'winnings') return `${Math.round(e.totalWinnings / 100)}€`;
    if (metric === 'volume') return `${Math.round(e.totalBuyIns / 100)}€`;
    return `${Math.round(e.points)}`;
  };

  const router = useRouter();
  const reduce = useReducedMotion();
  return (
    <Card className="gap-1 p-2">
      {entries.map((e, i) => {
        const me = currentUserId != null && e.user?.id === currentUserId;
        // Only account-linked players have a profile to open.
        const profileId = e.user?.id;
        return (
          <MotiView
            key={e.clubPlayerId}
            from={{ opacity: 0, translateY: reduce ? 0 : 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: reduce ? 0 : 320,
              delay: reduce ? 0 : Math.min(i, 12) * 35,
              easing: ppEasing,
            }}>
            <Pressable
              onPress={profileId ? () => router.push(`/player/${profileId}`) : undefined}
              disabled={!profileId}
              accessibilityRole={profileId ? 'button' : undefined}
              className={cn(
                'flex-row items-center gap-3 rounded-xl px-2 py-2.5',
                me && 'bg-pp-gold/20 border border-pp-gold/30'
              )}>
              <Text className={cn('w-7 text-center font-mono-medium', rankColor(e.rank))}>
                {e.rank}
              </Text>
              <Avatar name={fullName(e)} size={36} ring={e.rank === 1} />
              <View className="flex-1">
                <Text className="font-sans-semibold text-pp-text" numberOfLines={1}>
                  {fullName(e)}
                </Text>
                <Text variant="micro">
                  {e.totalTournaments} · {Math.round(e.itmPercentage)}% ITM
                </Text>
              </View>
              <Text className="font-mono-medium text-pp-gold">{value(e)}</Text>
            </Pressable>
          </MotiView>
        );
      })}
    </Card>
  );
}
