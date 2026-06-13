import { useQuery } from '@apollo/client/react';
import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AchievementGrid, BackButton } from '@/components';
import { AnimatedNumber } from '@/components/motion';
import { Card, ErrorState, Screen, SkeletonList, Text } from '@/components/ui';
import { GET_MY_ACHIEVEMENTS } from '@/graphql/operations';
import { useIsAuthenticated } from '@/stores/useAuthStore';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const { data, loading, error, refetch, networkStatus } = useQuery(GET_MY_ACHIEVEMENTS, {
    skip: !isAuth,
    notifyOnNetworkStatusChange: true,
  });

  if (!isAuth) return <Redirect href="/login" />;

  const items = data?.myAchievements ?? [];
  const unlocked = items.filter((a) => !a.isLocked).length;
  const completion = items.length ? Math.round((unlocked / items.length) * 100) : 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('achievements.title')}</Text>
        </View>

        {loading && !data ? (
          <SkeletonList count={6} />
        ) : error ? (
          <ErrorState
            message={t('common.errorLoading')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <Card highlighted className="gap-3">
              <View className="flex-row items-end justify-between">
                <View>
                  <AnimatedNumber
                    value={completion}
                    suffix="%"
                    variant="title"
                    className="text-pp-gold"
                  />
                  <Text variant="muted">{t('achievements.completion')}</Text>
                </View>
                <Text variant="mono" className="text-pp-gold-deep">
                  {unlocked}/{items.length}
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-white/10">
                <View
                  className="h-full rounded-full bg-pp-gold"
                  style={{ width: `${completion}%` }}
                />
              </View>
            </Card>

            <AchievementGrid items={items} />
          </>
        )}
      </Screen>
    </>
  );
}
