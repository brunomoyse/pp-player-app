import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Card, LoadingState, Screen, Text } from '@/components/ui';
import {
  ACCEPT_FRIEND_REQUEST,
  GET_INCOMING_FRIEND_REQUESTS,
  GET_MY_FRIENDS,
  GET_MY_RIVALRIES,
  REMOVE_FRIEND,
  SEND_FRIEND_REQUEST,
} from '@/graphql/operations';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { Friend } from '@/types/social';

const REFETCH = [{ query: GET_MY_FRIENDS }, { query: GET_INCOMING_FRIEND_REQUESTS }];

function FlameLabel({ friend }: { friend: Friend }) {
  const { t } = useTranslation();
  const flame = friend.flame;
  const nights = flame?.sharedNights ?? 0;
  const alive = flame?.alive ?? false;
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="flame" size={14} color={alive ? colors.gold : colors.textDim} />
      <Text variant="dim" className="text-[12px]">
        {t('friends.sharedNights', { count: nights })}
      </Text>
    </View>
  );
}

export default function FriendsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const [sentTo, setSentTo] = useState<string[]>([]);

  const friendsQ = useQuery(GET_MY_FRIENDS, { skip: !isAuth, notifyOnNetworkStatusChange: true });
  const incomingQ = useQuery(GET_INCOMING_FRIEND_REQUESTS, { skip: !isAuth });
  const rivalsQ = useQuery(GET_MY_RIVALRIES, { variables: { limit: 25 }, skip: !isAuth });

  const [sendRequest, { loading: sending }] = useMutation(SEND_FRIEND_REQUEST, {
    refetchQueries: REFETCH,
  });
  const [acceptRequest, { loading: accepting }] = useMutation(ACCEPT_FRIEND_REQUEST, {
    refetchQueries: REFETCH,
  });
  const [removeFriend] = useMutation(REMOVE_FRIEND, { refetchQueries: REFETCH });

  const friends = useMemo(() => friendsQ.data?.myFriends ?? [], [friendsQ.data]);
  const incoming = useMemo(
    () => incomingQ.data?.incomingFriendRequests ?? [],
    [incomingQ.data],
  );

  // People you've played who aren't already friends, pending, or just-invited.
  const suggestions = useMemo(() => {
    const known = new Set<string>([
      ...friends.map((f) => f.userId),
      ...incoming.map((f) => f.userId),
      ...sentTo,
    ]);
    return (rivalsQ.data?.myRivalries ?? []).filter((r) => !known.has(r.opponentId)).slice(0, 10);
  }, [friends, incoming, sentTo, rivalsQ.data]);

  const onSend = async (userId: string) => {
    setSentTo((prev) => [...prev, userId]);
    try {
      await sendRequest({ variables: { userId } });
    } catch {
      setSentTo((prev) => prev.filter((id) => id !== userId));
    }
  };

  if (!isAuth) return <Redirect href="/login" />;

  const loading = friendsQ.loading && !friendsQ.data;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={friendsQ.networkStatus === 4}
        onRefresh={() => void friendsQ.refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
          </Pressable>
          <Text variant="title">{t('friends.title')}</Text>
        </View>

        {loading ? (
          <LoadingState label={t('common.loading')} />
        ) : (
          <>
            {/* Incoming requests */}
            {incoming.length > 0 ? (
              <Card className="gap-1">
                <Text variant="label" className="mb-1 text-pp-gold-deep">
                  {t('friends.requests')}
                </Text>
                {incoming.map((f) => (
                  <View key={f.friendshipId} className="flex-row items-center gap-3 py-2">
                    <Avatar name={f.name} size={36} />
                    <Text className="flex-1 font-sans-semibold text-pp-text">{f.name}</Text>
                    <Button
                      title={t('friends.accept')}
                      variant="primary"
                      loading={accepting}
                      onPress={() => void acceptRequest({ variables: { friendshipId: f.friendshipId } })}
                    />
                    <Pressable
                      onPress={() => void removeFriend({ variables: { friendshipId: f.friendshipId } })}
                      accessibilityLabel={t('friends.decline')}
                      hitSlop={8}>
                      <Ionicons name="close" size={22} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </Card>
            ) : null}

            {/* Friends */}
            <Card className="gap-1">
              <Text variant="label" className="mb-1 text-pp-gold-deep">
                {t('friends.yourFriends')}
              </Text>
              {friends.length === 0 ? (
                <Text variant="dim" className="text-[12px]">
                  {t('friends.empty')}
                </Text>
              ) : (
                friends.map((f) => (
                  <View key={f.friendshipId} className="flex-row items-center gap-3 py-2">
                    <Avatar name={f.name} size={40} />
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-pp-text">{f.name}</Text>
                      <FlameLabel friend={f} />
                    </View>
                    <Pressable
                      onPress={() => void removeFriend({ variables: { friendshipId: f.friendshipId } })}
                      accessibilityLabel={t('friends.remove')}
                      hitSlop={8}>
                      <Ionicons name="ellipsis-horizontal" size={20} color={colors.textDim} />
                    </Pressable>
                  </View>
                ))
              )}
            </Card>

            {/* Suggestions from people you've played */}
            {suggestions.length > 0 ? (
              <Card className="gap-1">
                <Text variant="label" className="mb-1 text-pp-gold-deep">
                  {t('friends.peopleYouPlay')}
                </Text>
                {suggestions.map((r) => (
                  <View key={r.opponentId} className="flex-row items-center gap-3 py-2">
                    <Avatar name={r.opponentName} size={36} />
                    <Text className="flex-1 font-sans-semibold text-pp-text">{r.opponentName}</Text>
                    <Button
                      title={t('friends.add')}
                      variant="secondary"
                      loading={sending}
                      onPress={() => void onSend(r.opponentId)}
                    />
                  </View>
                ))}
              </Card>
            ) : null}
          </>
        )}
      </Screen>
    </>
  );
}
