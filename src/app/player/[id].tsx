import { useMutation, useQuery } from '@apollo/client/react';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AchievementCard } from '@/components/AchievementCard';
import { BackButton, StatCard } from '@/components';
import { Avatar, Badge, Button, Card, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import {
  ACCEPT_FRIEND_REQUEST,
  GET_INCOMING_FRIEND_REQUESTS,
  GET_MY_FRIENDS,
  GET_PLAYER_PROFILE,
  SEND_FRIEND_REQUEST,
} from '@/graphql/operations';
import { success } from '@/lib/haptics';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { currencyCents } from '@/utils/currency';

export default function PlayerProfileScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_PLAYER_PROFILE, {
    variables: { userId: id },
    skip: !isAuth || !id,
    notifyOnNetworkStatusChange: true,
  });

  const [sendRequest, { loading: sending }] = useMutation(SEND_FRIEND_REQUEST);
  const [acceptRequest, { loading: accepting }] = useMutation(ACCEPT_FRIEND_REQUEST, {
    refetchQueries: [{ query: GET_MY_FRIENDS }, { query: GET_INCOMING_FRIEND_REQUESTS }],
  });

  if (!isAuth) return <Redirect href="/login" />;

  const profile = data?.playerProfile;
  const s = profile?.statistics;
  const unlocked = profile?.achievements ?? [];
  const recent = profile?.recentResults ?? [];

  const onAdd = async () => {
    if (!profile) return;
    success();
    await sendRequest({ variables: { userId: profile.id } });
    void refetch();
  };
  const onAccept = async () => {
    if (!profile?.friendshipId) return;
    success();
    await acceptRequest({ variables: { friendshipId: profile.friendshipId } });
    void refetch();
  };

  const friendAction = () => {
    switch (profile?.friendship) {
      case 'NONE':
        return (
          <Button
            title={t('friends.add')}
            variant="primary"
            loading={sending}
            onPress={() => void onAdd()}
          />
        );
      case 'REQUEST_RECEIVED':
        return (
          <Button
            title={t('friends.accept')}
            variant="primary"
            loading={accepting}
            onPress={() => void onAccept()}
          />
        );
      case 'REQUEST_SENT':
        return <Badge tone="neutral" label={t('friends.pending')} />;
      case 'FRIENDS':
        return <Badge tone="gold" label={t('playerProfile.friends')} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('playerProfile.title')}</Text>
        </View>

        {loading && !data ? (
          <LoadingState label={t('common.loading')} />
        ) : error || !profile ? (
          <ErrorState
            message={t('common.errorLoading')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            {/* Identity + friend action */}
            <Card highlighted className="gap-3">
              <View className="flex-row items-center gap-3">
                <Avatar name={profile.name} size={56} ring />
                <Text variant="heading" className="flex-1">
                  {profile.name}
                </Text>
                {friendAction()}
              </View>
            </Card>

            {/* Lifetime stats */}
            <View className="flex-row gap-3">
              <StatCard
                icon="cash-outline"
                value={currencyCents(s?.totalWinnings ?? 0)}
                label={t('playerProfile.earnings')}
              />
              <StatCard
                icon="albums-outline"
                value={s?.totalTournaments ?? 0}
                label={t('playerProfile.tournaments')}
              />
              <StatCard
                icon="trophy-outline"
                value={`${Math.round(s?.itmPercentage ?? 0)}%`}
                label={t('playerProfile.itm')}
              />
            </View>

            {/* Achievements (unlocked) */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="heading">{t('achievements.title')}</Text>
                <Text variant="mono" className="text-pp-gold">
                  {unlocked.length}
                </Text>
              </View>
              {unlocked.length === 0 ? (
                <Text variant="dim">{t('playerProfile.noAchievements')}</Text>
              ) : (
                <View className="gap-3">
                  {unlocked.map((item) => (
                    <AchievementCard key={item.id} item={item} />
                  ))}
                </View>
              )}
            </View>

            {/* Recent finishes */}
            <Card className="gap-1">
              <Text variant="label" className="mb-1 text-pp-gold-deep">
                {t('playerProfile.recent')}
              </Text>
              {recent.length === 0 ? (
                <Text variant="dim">{t('playerProfile.noRecent')}</Text>
              ) : (
                recent.map((r) => (
                  <View
                    key={r.result.id}
                    className="flex-row items-center justify-between py-1.5">
                    <View className="flex-1 flex-row items-center gap-3">
                      <Text variant="mono" className="w-9 text-pp-gold">
                        #{r.result.finalPosition}
                      </Text>
                      <Text className="flex-1 font-sans-semibold text-pp-text" numberOfLines={1}>
                        {r.tournament.title}
                      </Text>
                    </View>
                    {r.result.prizeCents > 0 ? (
                      <Text className="font-sans-semibold text-pp-success">
                        {currencyCents(r.result.prizeCents)}
                      </Text>
                    ) : null}
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
