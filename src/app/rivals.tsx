import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Avatar, Card, EmptyState, LoadingState, Screen, Text } from '@/components/ui';
import { GET_MY_RIVALRIES } from '@/graphql/operations';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { Rivalry } from '@/types/social';

function record(r: Rivalry) {
  return `${r.wins}–${r.losses}`;
}

export default function RivalsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();

  const { data, loading, refetch, networkStatus } = useQuery(GET_MY_RIVALRIES, {
    variables: { limit: 25 },
    skip: !isAuth,
    notifyOnNetworkStatusChange: true,
  });

  const rivalries = useMemo(() => data?.myRivalries ?? [], [data]);
  // The nemesis is the opponent who has beaten you most (ties broken by meetings).
  const nemesis = useMemo(() => {
    let best: Rivalry | null = null;
    for (const r of rivalries) {
      if (r.losses <= 0) continue;
      if (!best || r.losses > best.losses || (r.losses === best.losses && r.meetings > best.meetings)) {
        best = r;
      }
    }
    return best;
  }, [rivalries]);

  if (!isAuth) return <Redirect href="/login" />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
          </Pressable>
          <Text variant="title">{t('rivals.title')}</Text>
        </View>

        {loading && !data ? (
          <LoadingState label={t('common.loading')} />
        ) : rivalries.length === 0 ? (
          <EmptyState icon="people-outline" message={t('rivals.empty')} />
        ) : (
          <>
            {/* Nemesis hero */}
            {nemesis ? (
              <Card highlighted className="items-center gap-2 py-5">
                <Text variant="label" className="text-pp-gold-deep">
                  {t('rivals.nemesis')}
                </Text>
                <Avatar name={nemesis.opponentName} size={72} ring />
                <Text variant="heading" className="text-center">
                  {nemesis.opponentName}
                </Text>
                <Text variant="muted" className="text-center">
                  {t('rivals.nemesisLine', {
                    losses: nemesis.losses,
                    meetings: nemesis.meetings,
                  })}
                </Text>
              </Card>
            ) : null}

            {/* Full head-to-head ledger */}
            <Card className="gap-1">
              <View className="mb-1 flex-row items-center justify-between">
                <Text variant="label" className="text-pp-gold-deep">
                  {t('rivals.headToHead')}
                </Text>
                <Text variant="dim" className="text-[11px]">
                  {t('rivals.recordLegend')}
                </Text>
              </View>
              {rivalries.map((r) => (
                <View key={r.opponentId} className="flex-row items-center gap-3 py-2">
                  <Avatar name={r.opponentName} size={36} />
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-pp-text">{r.opponentName}</Text>
                    <Text variant="dim" className="text-[12px]">
                      {t('rivals.meetings', { count: r.meetings })}
                    </Text>
                  </View>
                  <Text
                    className={
                      r.wins > r.losses
                        ? 'font-sans-semibold text-pp-success'
                        : r.wins < r.losses
                          ? 'font-sans-semibold text-pp-danger'
                          : 'font-sans-semibold text-pp-text'
                    }>
                    {record(r)}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}
      </Screen>
    </>
  );
}
