import { useQuery } from '@apollo/client/react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar, Card, EmptyState, LoadingState, Screen, Text } from '@/components/ui';
import { BackButton } from '@/components';
import { GET_TOURNAMENT_BOUNTIES, GET_TOURNAMENT_RESULTS } from '@/graphql/operations';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/useAuthStore';
import { currencyCents } from '@/utils/currency';

/** Medal colours for the podium, dim for the rest of the field. */
function positionColor(position: number): string {
  if (position === 1) return 'text-pp-gold';
  if (position === 2) return 'text-pp-text-muted';
  if (position === 3) return 'text-pp-gold-deep';
  return 'text-pp-text-dim';
}

export default function TournamentResultsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.currentUser);

  const { data, loading, refetch, networkStatus } = useQuery(GET_TOURNAMENT_RESULTS, {
    variables: { tournamentId: id! },
    skip: !id,
    notifyOnNetworkStatusChange: true,
  });
  // Knockout feed — empty for non-PKO tournaments, so a single fetch is safe.
  const { data: bountyData } = useQuery(GET_TOURNAMENT_BOUNTIES, {
    variables: { tournamentId: id! },
    skip: !id,
  });

  const results = useMemo(
    () => [...(data?.tournamentResults ?? [])].sort((a, b) => a.finalPosition - b.finalPosition),
    [data],
  );
  const bounties = bountyData?.tournamentBounties ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('events.finalResults')}</Text>
        </View>

        {loading && !data ? (
          <LoadingState label={t('common.loading')} />
        ) : results.length === 0 ? (
          <EmptyState icon="trophy-outline" message={t('events.resultsEmpty')} />
        ) : (
          <>
            <Card className="gap-1 p-2">
              {results.map((r) => {
                const me = currentUser?.id != null && r.userId === currentUser.id;
                return (
                  <View
                    key={r.id}
                    className={cn(
                      'flex-row items-center gap-3 rounded-xl px-2 py-2.5',
                      me && 'border border-pp-gold/30 bg-pp-gold/20',
                    )}>
                    <Text
                      className={cn(
                        'w-7 text-center font-mono-medium',
                        positionColor(r.finalPosition),
                      )}>
                      {r.finalPosition}
                    </Text>
                    <Avatar name={r.displayName} size={36} ring={r.finalPosition === 1} />
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-pp-text" numberOfLines={1}>
                        {r.displayName}
                      </Text>
                      {r.points > 0 ? (
                        <Text variant="micro">
                          {t('events.resultsPoints', { count: r.points })}
                        </Text>
                      ) : null}
                    </View>
                    {r.prizeCents > 0 ? (
                      <Text className="font-mono-medium text-pp-success">
                        {currencyCents(r.prizeCents)}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </Card>

            {/* Knockout feed — only present on bounty / PKO tournaments. */}
            {bounties.length > 0 ? (
              <View className="gap-2">
                <Text variant="heading">{t('events.knockouts.title')}</Text>
                <Card className="gap-1">
                  {bounties.map((k) => (
                    <View key={k.id} className="flex-row items-center gap-3 py-2">
                      <Avatar name={k.hunterName} size={36} />
                      <View className="flex-1">
                        <Text className="font-sans-semibold text-pp-text" numberOfLines={1}>
                          {k.hunterName}
                        </Text>
                        <Text variant="dim" numberOfLines={1}>
                          {t('events.knockouts.eliminated', { victim: k.victimName })}
                        </Text>
                      </View>
                      <Text className="font-mono-medium text-pp-gold">
                        {currencyCents(k.amountCents)}
                      </Text>
                    </View>
                  ))}
                </Card>
              </View>
            ) : null}
          </>
        )}
      </Screen>
    </>
  );
}
