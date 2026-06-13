import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BackButton, StatCard } from '@/components';
import { Card, EmptyState, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { GET_MY_PRO_ANALYTICS } from '@/graphql/operations';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useIsPro } from '@/hooks/useIsPro';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import { currencyCents } from '@/utils/currency';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const flags = useFeatureFlags();
  const isPro = useIsPro();

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_MY_PRO_ANALYTICS, {
    skip: !isAuth || !flags.proAccount || !isPro,
    notifyOnNetworkStatusChange: true,
  });

  if (!isAuth) return <Redirect href="/login" />;

  const a = data?.myProAnalytics;
  const netTotal = a?.cumulativePnl.length
    ? a.cumulativePnl[a.cumulativePnl.length - 1].cumulativeCents
    : 0;
  const tournamentsTotal = (a?.byClub ?? []).reduce((sum, c) => sum + c.tournaments, 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('pro.analyticsTitle')}</Text>
        </View>

        {!flags.proAccount ? (
          <EmptyState message={t('common.notYetAvailable')} />
        ) : !isPro ? (
          <Card highlighted className="items-center gap-3 py-6">
            <Ionicons name="sparkles-outline" size={32} color={colors.gold} />
            <Text variant="heading" className="text-center">
              {t('pro.upsellTitle')}
            </Text>
            <Text variant="muted" className="text-center">
              {t('pro.upsellBody')}
            </Text>
          </Card>
        ) : loading && !data ? (
          <LoadingState label={t('common.loading')} />
        ) : error ? (
          <ErrorState
            message={t('common.errorLoading')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <View className="flex-row gap-3">
              <StatCard
                icon="trending-up-outline"
                value={currencyCents(netTotal)}
                label={t('pro.netProfit')}
              />
              <StatCard
                icon="albums-outline"
                value={tournamentsTotal}
                label={t('pro.tournaments')}
              />
            </View>

            {/* By club */}
            <Card className="gap-2">
              <Text variant="label" className="mb-1 text-pp-gold-deep">
                {t('pro.byClub')}
              </Text>
              {(a?.byClub ?? []).length === 0 ? (
                <Text variant="dim">
                  {t('pro.noData')}
                </Text>
              ) : (
                (a?.byClub ?? []).map((c) => (
                  <View key={c.clubId} className="flex-row items-center justify-between py-1.5">
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-pp-text">{c.clubName}</Text>
                      <Text variant="dim">
                        {c.tournaments} {t('pro.tournaments').toLowerCase()}
                      </Text>
                    </View>
                    <Text
                      className={c.netCents >= 0 ? 'font-sans-semibold text-pp-success' : 'font-sans-semibold text-pp-danger'}>
                      {currencyCents(c.netCents)}
                    </Text>
                  </View>
                ))
              )}
            </Card>

            {/* By buy-in */}
            <Card className="gap-2">
              <Text variant="label" className="mb-1 text-pp-gold-deep">
                {t('pro.byBuyIn')}
              </Text>
              {(a?.byBuyIn ?? []).length === 0 ? (
                <Text variant="dim">
                  {t('pro.noData')}
                </Text>
              ) : (
                (a?.byBuyIn ?? []).map((b) => (
                  <View key={b.buyInCents} className="flex-row items-center justify-between py-1.5">
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-pp-text">
                        {currencyCents(b.buyInCents)}
                      </Text>
                      <Text variant="dim">
                        {b.tournaments} {t('pro.tournaments').toLowerCase()}
                      </Text>
                    </View>
                    <Text
                      className={b.netCents >= 0 ? 'font-sans-semibold text-pp-success' : 'font-sans-semibold text-pp-danger'}>
                      {currencyCents(b.netCents)}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </Screen>
    </>
  );
}
