import { useQuery } from '@apollo/client/react';
import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BackButton } from '@/components';
import { Badge, Card, EmptyState, ErrorState, Screen, SkeletonList, Text } from '@/components/ui';
import type { BadgeTone } from '@/components/ui';
import { GET_MY_ANNOUNCEMENTS } from '@/graphql/operations';
import type { AnnouncementScope } from '@/graphql/operations';
import { useIsAuthenticated } from '@/stores/useAuthStore';

function scopeTone(scope: AnnouncementScope): BadgeTone {
  switch (scope) {
    case 'CLUB':
      return 'gold';
    case 'PLATFORM':
      return 'upcoming';
    default:
      return 'neutral';
  }
}

export default function AnnouncementsScreen() {
  const { t, i18n } = useTranslation();
  const isAuth = useIsAuthenticated();
  const { data, loading, error, refetch, networkStatus } = useQuery(GET_MY_ANNOUNCEMENTS, {
    skip: !isAuth,
    notifyOnNetworkStatusChange: true,
  });

  if (!isAuth) return <Redirect href="/login" />;

  const items = data?.myAnnouncements.items ?? [];

  const scopeLabel = (scope: AnnouncementScope) => {
    if (scope === 'CLUB') return t('announcements.scopeClub');
    if (scope === 'PLATFORM') return t('announcements.scopePlatform');
    return t('announcements.scopeTournament');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('announcements.title')}</Text>
        </View>

        {loading && !data ? (
          <SkeletonList count={5} />
        ) : error ? (
          <ErrorState
            message={t('common.errorLoading')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState icon="megaphone-outline" message={t('announcements.empty')} />
        ) : (
          items.map((item) => (
            <Card key={item.id} className="gap-2">
              <View className="flex-row items-center justify-between gap-3">
                <Badge label={scopeLabel(item.scope)} tone={scopeTone(item.scope)} />
                <Text variant="caption" className="text-pp-text-dim">
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <Text variant="heading">{item.title}</Text>
              <Text variant="muted">{item.body}</Text>
            </Card>
          ))
        )}
      </Screen>
    </>
  );
}
