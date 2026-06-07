import { View } from 'react-native';

import { Avatar, Card, Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { LeaderboardEntry } from '@/types/tournament';

function fullName(e: LeaderboardEntry): string {
  return e.displayName || (e.user?.username ?? ([e.user?.firstName, e.user?.lastName].filter(Boolean).join(' ') || '—'));
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
  metric?: 'points' | 'profit' | 'volume';
}

export function LeaderboardTable({ entries, currentUserId, metric = 'points' }: LeaderboardTableProps) {
  const value = (e: LeaderboardEntry) => {
    if (metric === 'profit') return `${e.netProfit >= 0 ? '+' : ''}${Math.round(e.netProfit / 100)}€`;
    if (metric === 'volume') return `${Math.round(e.totalBuyIns / 100)}€`;
    return `${Math.round(e.points)}`;
  };

  return (
    <Card className="gap-1 p-2">
      {entries.map((e) => {
        const me = currentUserId != null && e.user?.id === currentUserId;
        return (
          <View
            key={e.registeredPlayerId}
            className={cn(
              'flex-row items-center gap-3 rounded-xl px-2 py-2.5',
              me && 'bg-pp-gold/10'
            )}>
            <Text className={cn('w-7 text-center font-mono-medium', rankColor(e.rank))}>
              {e.rank}
            </Text>
            <Avatar name={fullName(e)} size={36} ring={e.rank === 1} />
            <View className="flex-1">
              <Text className="font-sans-semibold text-pp-text" numberOfLines={1}>
                {fullName(e)}
              </Text>
              <Text variant="dim" className="text-[11px]">
                {e.totalTournaments} · {Math.round(e.itmPercentage)}% ITM
              </Text>
            </View>
            <Text className="font-mono-medium text-pp-gold">{value(e)}</Text>
          </View>
        );
      })}
    </Card>
  );
}
