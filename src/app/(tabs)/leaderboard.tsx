import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';

import { LeaderboardTable } from '@/components';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Screen,
  Segment,
  Text,
} from '@/components/ui';
import { colors } from '@/theme/tokens';
import { GET_LEADERBOARD, GET_LEADERBOARD_CONFIGS } from '@/graphql/operations';
import { useClubs } from '@/hooks/useClubs';
import { useClubStore } from '@/stores/useClubStore';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import type { LeaderboardPeriod } from '@/types/tournament';

// No weekly board (players mostly play once a week) and winnings instead of
// net profit (a public loss column discourages play).
type Period = 'month' | 'year' | 'allTime';
type Metric = 'overall' | 'winnings' | 'volume';

/** Sentinel for the default (period-based) leaderboard, where no league is selected. */
const DEFAULT_LEAGUE = '__default__';

/** Max points a single result can score (mirrors the backend ScoringFormula default). */
const POINTS_CAP = 60;

const PERIOD_ENUM: Record<Period, LeaderboardPeriod> = {
  month: 'LAST_30_DAYS',
  year: 'LAST_YEAR',
  allTime: 'ALL_TIME',
};
const METRIC_MAP: Record<Metric, 'points' | 'winnings' | 'volume'> = {
  overall: 'points',
  winnings: 'winnings',
  volume: 'volume',
};

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  useClubs();
  const isAuth = useIsAuthenticated();
  const currentUser = useAuthStore((s) => s.currentUser);
  const selectedClub = useClubStore((s) => s.selectedClub);
  const [period, setPeriod] = useState<Period>('month');
  const [metric, setMetric] = useState<Metric>('overall');
  const [league, setLeague] = useState<string>(DEFAULT_LEAGUE);
  const [scoringOpen, setScoringOpen] = useState(false);

  // Configurable leaderboards (leagues) for the selected club. Empty -> selector hidden.
  const { data: configsData } = useQuery(GET_LEADERBOARD_CONFIGS, {
    variables: { clubId: selectedClub?.id ?? '' },
    skip: !selectedClub?.id,
  });
  const leagues = configsData?.leaderboardConfigs ?? [];
  const activeConfigId = league === DEFAULT_LEAGUE ? null : league;

  const { data, previousData, loading, error, refetch, networkStatus } = useQuery(GET_LEADERBOARD, {
    variables: {
      period: PERIOD_ENUM[period],
      clubId: selectedClub?.id ?? null,
      configId: activeConfigId,
      pagination: { limit: 50, offset: 0 },
    },
    notifyOnNetworkStatusChange: true,
  });

  // Keep the previous list on screen while new variables (period/league/club)
  // load — segment changes swap values instead of flashing back to a spinner.
  const view = data ?? previousData;
  const entries = view?.leaderboard.items ?? [];
  const me = currentUser ? entries.find((e) => e.user?.id === currentUser.id) : undefined;

  const periodSegments = (['month', 'year', 'allTime'] as Period[]).map((p) => ({
    value: p,
    label: t(`leaderboard.periods.${p}`),
  }));
  const metricSegments = (['overall', 'winnings', 'volume'] as Metric[]).map((m) => ({
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
      <View className="flex-row items-center justify-between">
        <Text variant="title">{t('leaderboard.title')}</Text>
        <IconButton
          name="information-circle-outline"
          size={22}
          accessibilityLabel={t('leaderboard.scoring.title')}
          onPress={() => setScoringOpen(true)}
        />
      </View>

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

      {loading && !view ? (
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
        <View style={{ opacity: loading ? 0.5 : 1 }}>
          <LeaderboardTable
            entries={entries}
            currentUserId={currentUser?.id}
            metric={METRIC_MAP[metric]}
          />
        </View>
      )}

      <Modal
        visible={scoringOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setScoringOpen(false)}>
        <Pressable
          onPress={() => setScoringOpen(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(10,10,12,0.6)' }}>
          <View
            onStartShouldSetResponder={() => true}
            accessibilityViewIsModal
            className="gap-4 rounded-t-2xl border-t border-pp-border bg-pp-surface px-5 pb-8 pt-5">
            <Text variant="heading">{t('leaderboard.scoring.title')}</Text>
            <Text variant="muted">{t('leaderboard.scoring.intro')}</Text>
            <View className="gap-2.5">
              {(
                [
                  { icon: 'trophy-outline', key: 'finish' },
                  { icon: 'people-outline', key: 'field' },
                  { icon: 'cash-outline', key: 'buyin' },
                ] as const
              ).map((row) => (
                <View key={row.key} className="flex-row items-center gap-3">
                  <Ionicons name={row.icon} size={18} color={colors.gold} />
                  <Text className="flex-1 text-pp-text">
                    {t(`leaderboard.scoring.${row.key}`)}
                  </Text>
                </View>
              ))}
            </View>
            <View className="gap-1.5 rounded-xl bg-white/5 p-3">
              <Text variant="dim">{t('leaderboard.scoring.cap', { cap: POINTS_CAP })}</Text>
              <Text variant="dim">{t('leaderboard.scoring.total')}</Text>
              <Text variant="dim">{t('leaderboard.scoring.metrics')}</Text>
            </View>
            <Button title={t('leaderboard.scoring.gotIt')} onPress={() => setScoringOpen(false)} />
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}
