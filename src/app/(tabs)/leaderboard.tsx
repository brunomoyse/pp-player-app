import { useQuery } from '@apollo/client/react';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LeaderboardTable } from '@/components';
import { Button, Card, EmptyState, ErrorState, LoadingState, Screen, Segment, Text } from '@/components/ui';
import { GET_LEADERBOARD, GET_LEADERBOARD_CONFIGS } from '@/graphql/operations';
import { useClubs } from '@/hooks/useClubs';
import { useClubStore } from '@/stores/useClubStore';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import type { LeaderboardPeriod } from '@/types/tournament';

type Period = 'week' | 'month' | 'year' | 'allTime';
type Metric = 'overall' | 'profit' | 'volume';

/** Sentinel for the default (period-based) leaderboard, where no league is selected. */
const DEFAULT_LEAGUE = '__default__';

const PERIOD_ENUM: Record<Period, LeaderboardPeriod> = {
  week: 'LAST_7_DAYS',
  month: 'LAST_30_DAYS',
  year: 'LAST_YEAR',
  allTime: 'ALL_TIME',
};
const METRIC_MAP: Record<Metric, 'points' | 'profit' | 'volume'> = {
  overall: 'points',
  profit: 'profit',
  volume: 'volume',
};

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  useClubs();
  const isAuth = useIsAuthenticated();
  const currentUser = useAuthStore((s) => s.currentUser);
  const selectedClub = useClubStore((s) => s.selectedClub);
  const [period, setPeriod] = useState<Period>('week');
  const [metric, setMetric] = useState<Metric>('overall');
  const [league, setLeague] = useState<string>(DEFAULT_LEAGUE);

  // Configurable leaderboards (leagues) for the selected club. Empty -> selector hidden.
  const { data: configsData } = useQuery(GET_LEADERBOARD_CONFIGS, {
    variables: { clubId: selectedClub?.id ?? '' },
    skip: !selectedClub?.id,
  });
  const leagues = configsData?.leaderboardConfigs ?? [];
  const activeConfigId = league === DEFAULT_LEAGUE ? null : league;

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_LEADERBOARD, {
    variables: {
      period: PERIOD_ENUM[period],
      clubId: selectedClub?.id ?? null,
      configId: activeConfigId,
      pagination: { limit: 50, offset: 0 },
    },
    notifyOnNetworkStatusChange: true,
  });

  const entries = data?.leaderboard.items ?? [];
  const me = currentUser ? entries.find((e) => e.user?.id === currentUser.id) : undefined;

  const periodSegments = (['week', 'month', 'year', 'allTime'] as Period[]).map((p) => ({
    value: p,
    label: t(`leaderboard.periods.${p}`),
  }));
  const metricSegments = (['overall', 'profit', 'volume'] as Metric[]).map((m) => ({
    value: m,
    label: t(`leaderboard.categories.${m}`),
  }));
  const leagueSegments = [
    { value: DEFAULT_LEAGUE, label: t('leaderboard.defaultView') },
    ...leagues.map((lg) => ({ value: lg.id, label: lg.name })),
  ];

  return (
    <Screen
      refreshing={networkStatus === 4}
      onRefresh={() => void refetch()}
      contentClassName="gap-4">
      <Text variant="title">{t('leaderboard.title')}</Text>

      {isAuth && me ? (
        <Card highlighted className="flex-row items-center justify-between">
          <View>
            <Text variant="label" className="text-pp-gold-deep">
              {t('leaderboard.yourRank')}
            </Text>
            <Text variant="heading" className="text-pp-gold">
              #{me.rank}
            </Text>
          </View>
          <View className="items-end">
            <Text variant="mono" className="text-pp-gold">
              {Math.round(me.points)}
            </Text>
            <Text variant="micro">
              {t('leaderboard.points')}
            </Text>
          </View>
        </Card>
      ) : !isAuth ? (
        <Card className="gap-2">
          <Text variant="heading">{t('leaderboard.guestTitle')}</Text>
          <Text variant="muted">{t('leaderboard.guestSubtitle')}</Text>
          <Button
            title={t('leaderboard.loginToCompete')}
            className="mt-1"
            onPress={() => router.push('/login')}
          />
        </Card>
      ) : null}

      {leagues.length > 0 ? (
        <Segment options={leagueSegments} value={league} onChange={setLeague} />
      ) : null}
      {activeConfigId === null ? (
        <Segment options={periodSegments} value={period} onChange={setPeriod} />
      ) : null}
      <Segment options={metricSegments} value={metric} onChange={setMetric} />

      {loading && !data ? (
        <LoadingState label={t('common.loading')} />
      ) : error ? (
        <ErrorState
          message={t('common.errorLoading')}
          retryLabel={t('common.retry')}
          onRetry={() => void refetch()}
        />
      ) : entries.length === 0 ? (
        <EmptyState icon="podium-outline" message={t('leaderboard.empty.title')} />
      ) : (
        <LeaderboardTable
          entries={entries}
          currentUserId={currentUser?.id}
          metric={METRIC_MAP[metric]}
        />
      )}
    </Screen>
  );
}
