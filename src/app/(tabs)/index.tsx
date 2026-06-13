import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ClubSelector, StatCard, TournamentCard } from '@/components';
import { AnimatedNumber, FadeUp, Stagger } from '@/components/motion';
import { Button, Card, Screen, Text } from '@/components/ui';
import {
  GET_MY_RECENT_RESULTS,
  GET_MY_STATISTICS,
  GET_TOURNAMENTS,
} from '@/graphql/operations';
import { useClubs } from '@/hooks/useClubs';
import { useClubStore } from '@/stores/useClubStore';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { PlayerStatistics } from '@/types/tournament';
import { currencyCents } from '@/utils/currency';
import { formatDate } from '@/utils/datetime';

type Range = '7d' | '30d' | '1y';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  useClubs();
  const isAuth = useIsAuthenticated();
  const user = useAuthStore((s) => s.currentUser);
  const selectedClub = useClubStore((s) => s.selectedClub);
  const [range, setRange] = useState<Range>('7d');

  const upcoming = useQuery(GET_TOURNAMENTS, {
    variables: {
      clubId: selectedClub?.id ?? null,
      status: 'UPCOMING',
      pagination: { limit: 5, offset: 0 },
    },
    notifyOnNetworkStatusChange: true,
  });
  const stats = useQuery(GET_MY_STATISTICS, { skip: !isAuth });
  const recent = useQuery(GET_MY_RECENT_RESULTS, { variables: { limit: 5 }, skip: !isAuth });

  const refreshAll = () => {
    void upcoming.refetch();
    if (isAuth) {
      void stats.refetch();
      void recent.refetch();
    }
  };

  const statBlock: PlayerStatistics | undefined = (() => {
    const s = stats.data?.myTournamentStatistics;
    if (!s) return undefined;
    return range === '7d' ? s.last7Days : range === '30d' ? s.last30Days : s.lastYear;
  })();

  const nextTournaments = upcoming.data?.tournaments.items ?? [];
  const results = recent.data?.myRecentTournamentResults ?? [];
  const rangeChips: Range[] = ['7d', '30d', '1y'];

  return (
    <Screen
      refreshing={upcoming.networkStatus === 4}
      onRefresh={refreshAll}
      contentClassName="gap-5">
      <FadeUp>
        <Text variant="title">
          {isAuth
            ? t('home.trackYourEdge', { username: user?.username ?? user?.firstName ?? '' })
            : t('home.explorePocketPair')}
        </Text>
      </FadeUp>

      <ClubSelector />

      {isAuth ? (
        <FadeUp delay={80}>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text variant="heading">
                {t('home.progress.title', { range: range.toUpperCase() })}
              </Text>
              <View className="flex-row gap-1.5">
                {rangeChips.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRange(r)}
                    className={
                      r === range
                        ? 'rounded-full bg-pp-gold px-2.5 py-1'
                        : 'rounded-full border border-pp-border px-2.5 py-1'
                    }>
                    <Text
                      className={
                        r === range
                          ? 'text-[11px] font-sans-semibold text-pp-bg'
                          : 'text-[11px] font-sans-medium text-pp-text-muted'
                      }>
                      {t(`home.progress.timeLabels.${r}`)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="flex-row gap-3">
              <StatCard
                icon="trophy-outline"
                label={t('home.kpis.itm')}
                value={
                  <AnimatedNumber
                    value={statBlock?.itmPercentage ?? 0}
                    suffix="%"
                    variant="title"
                    className="text-pp-gold"
                  />
                }
              />
              <StatCard
                icon="trending-up-outline"
                label={t('home.kpis.roi')}
                value={
                  <AnimatedNumber
                    value={statBlock?.roiPercentage ?? 0}
                    suffix="%"
                    variant="title"
                    className="text-pp-gold"
                  />
                }
              />
              <StatCard
                icon="cash-outline"
                label={t('home.kpis.cashes')}
                value={
                  <AnimatedNumber
                    value={statBlock?.totalItm ?? 0}
                    variant="title"
                    className="text-pp-gold"
                  />
                }
              />
            </View>
          </View>
        </FadeUp>
      ) : (
        <Card className="gap-2">
          <Text variant="heading" className="text-pp-gold">
            {t('home.unlockFeatures')}
          </Text>
          <Text variant="muted">{t('home.ctaDescription')}</Text>
          <Button title={t('auth.login')} className="mt-1" onPress={() => router.push('/login')} />
        </Card>
      )}

      {/* Next tournaments */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="heading">{t('home.tournaments.title')}</Text>
          <Pressable onPress={() => router.push('/tournaments')} hitSlop={8}>
            <Text className="text-[13px] font-sans-semibold text-pp-gold">
              {t('home.tournaments.seeAll')}
            </Text>
          </Pressable>
        </View>
        {nextTournaments.length === 0 ? (
          <Card>
            <Text variant="muted">{t('events.empty.title')}</Text>
          </Card>
        ) : (
          <Stagger className="gap-3">
            {nextTournaments.map((tn) => (
              <TournamentCard
                key={tn.id}
                tournament={{ ...tn, registrations: [] }}
                onPress={() => router.push(`/tournament/${tn.id}`)}
              />
            ))}
          </Stagger>
        )}
      </View>

      {/* Recent results */}
      {isAuth && results.length > 0 ? (
        <View className="gap-3">
          <Text variant="heading">{t('home.results.title')}</Text>
          <Card className="gap-1 p-2">
            {results.map(({ result, tournament }) => (
              <View key={result.id} className="flex-row items-center gap-3 rounded-xl px-2 py-2.5">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white/5">
                  <Text variant="mono" className="text-pp-gold">
                    {result.finalPosition}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-sans-semibold text-pp-text" numberOfLines={1}>
                    {tournament.title}
                  </Text>
                  <Text variant="micro">
                    {formatDate(tournament.startTime, i18n.language)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="cash-outline" size={13} color={colors.success} />
                  <Text className="font-mono-medium text-pp-success">
                    {currencyCents(result.prizeCents)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
