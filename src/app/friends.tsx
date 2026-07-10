import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Avatar, Button, Card, IconButton, Input, LoadingState, Screen, Text } from '@/components/ui';
import { BackButton } from '@/components';
import { success } from '@/lib/haptics';
import {
  ACCEPT_FRIEND_REQUEST,
  GET_INCOMING_FRIEND_REQUESTS,
  GET_MY_FRIENDS,
  GET_OUTGOING_FRIEND_REQUESTS,
  REMOVE_FRIEND,
  SEARCH_PLAYERS,
  SEND_FRIEND_REQUEST,
  SET_FRIEND_REGISTRATION_PERMISSION,
} from '@/graphql/operations';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { Friend } from '@/types/social';

function displayName(hit: { username?: string | null; firstName: string; lastName?: string | null }) {
  return hit.username || [hit.firstName, hit.lastName].filter(Boolean).join(' ');
}

const REFETCH = [
  { query: GET_MY_FRIENDS },
  { query: GET_INCOMING_FRIEND_REQUESTS },
  { query: GET_OUTGOING_FRIEND_REQUESTS },
];

function FlameLabel({ friend }: { friend: Friend }) {
  const { t } = useTranslation();
  const flame = friend.flame;
  const nights = flame?.sharedNights ?? 0;
  const alive = flame?.alive ?? false;
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="flame" size={14} color={alive ? colors.gold : colors.textDim} />
      <Text variant="dim">
        {t('friends.sharedNights', { count: nights })}
      </Text>
    </View>
  );
}

export default function FriendsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [query, setQuery] = useState('');

  const friendsQ = useQuery(GET_MY_FRIENDS, { skip: !isAuth, notifyOnNetworkStatusChange: true });
  const incomingQ = useQuery(GET_INCOMING_FRIEND_REQUESTS, { skip: !isAuth });
  const outgoingQ = useQuery(GET_OUTGOING_FRIEND_REQUESTS, { skip: !isAuth });
  const searchQ = useQuery(SEARCH_PLAYERS, {
    variables: { search: query.trim() },
    skip: !isAuth || query.trim().length < 2,
  });

  const [sendRequest, { loading: sending }] = useMutation(SEND_FRIEND_REQUEST, {
    refetchQueries: REFETCH,
  });
  const [acceptRequest, { loading: accepting }] = useMutation(ACCEPT_FRIEND_REQUEST, {
    refetchQueries: REFETCH,
  });
  const [removeFriend] = useMutation(REMOVE_FRIEND, { refetchQueries: REFETCH });
  const [setRegPermission] = useMutation(SET_FRIEND_REGISTRATION_PERMISSION, {
    refetchQueries: REFETCH,
  });

  const friends = useMemo(() => friendsQ.data?.myFriends ?? [], [friendsQ.data]);
  const incoming = useMemo(
    () => incomingQ.data?.incomingFriendRequests ?? [],
    [incomingQ.data],
  );
  const outgoing = useMemo(
    () => outgoingQ.data?.outgoingFriendRequests ?? [],
    [outgoingQ.data],
  );

  // Search hits that aren't the current user, already friends, pending (in or
  // out), or just-invited this session.
  const results = useMemo(() => {
    const known = new Set<string>([
      currentUser?.id ?? '',
      ...friends.map((f) => f.userId),
      ...incoming.map((f) => f.userId),
      ...outgoing.map((f) => f.userId),
      ...sentTo,
    ]);
    return (searchQ.data?.users.items ?? []).filter((u) => !known.has(u.id));
  }, [currentUser, friends, incoming, outgoing, sentTo, searchQ.data]);

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
          <BackButton />
          <Text variant="title">{t('friends.title')}</Text>
        </View>

        <Input
          placeholder={t('friends.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {/* Search results */}
        {query.trim().length >= 2 ? (
          <Card className="gap-1">
            <Text variant="label" className="mb-1 text-pp-gold-deep">
              {t('friends.searchResults')}
            </Text>
            {results.length === 0 ? (
              <Text variant="dim">{t('friends.noResults')}</Text>
            ) : (
              results.map((u) => (
                <View key={u.id} className="flex-row items-center gap-3 py-2">
                  <Avatar name={displayName(u)} size={36} />
                  <Text className="flex-1 font-sans-semibold text-pp-text">{displayName(u)}</Text>
                  <Button
                    title={t('friends.add')}
                    variant="secondary"
                    loading={sending}
                    onPress={() => void onSend(u.id)}
                  />
                </View>
              ))
            )}
          </Card>
        ) : null}

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
                      accessibilityHint={t('friends.a11y.acceptHint')}
                      onPress={() => {
                        success();
                        void acceptRequest({ variables: { friendshipId: f.friendshipId } });
                      }}
                    />
                    <IconButton
                      name="close"
                      size={22}
                      accessibilityLabel={t('friends.decline')}
                      accessibilityHint={t('friends.a11y.declineHint')}
                      onPress={() => void removeFriend({ variables: { friendshipId: f.friendshipId } })}
                    />
                  </View>
                ))}
              </Card>
            ) : null}

            {/* Outgoing requests (sent, awaiting acceptance) */}
            {outgoing.length > 0 ? (
              <Card className="gap-1">
                <Text variant="label" className="mb-1 text-pp-gold-deep">
                  {t('friends.sent')}
                </Text>
                {outgoing.map((f) => (
                  <View key={f.friendshipId} className="flex-row items-center gap-3 py-2">
                    <Avatar name={f.name} size={36} />
                    <Text className="flex-1 font-sans-semibold text-pp-text">{f.name}</Text>
                    <Text variant="dim">
                      {t('friends.pending')}
                    </Text>
                    <IconButton
                      name="close"
                      size={22}
                      accessibilityLabel={t('friends.cancel')}
                      onPress={() => void removeFriend({ variables: { friendshipId: f.friendshipId } })}
                    />
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
                <Text variant="dim">
                  {t('friends.empty')}
                </Text>
              ) : (
                friends.map((f) => (
                  <View key={f.friendshipId} className="gap-2 py-2">
                    <View className="flex-row items-center gap-3">
                      <Avatar name={f.name} size={40} />
                      <View className="flex-1">
                        <Text className="font-sans-semibold text-pp-text">{f.name}</Text>
                        <FlameLabel friend={f} />
                      </View>
                      <IconButton
                        name="ellipsis-horizontal"
                        size={20}
                        color={colors.textDim}
                        accessibilityLabel={t('friends.remove')}
                        accessibilityHint={t('friends.a11y.removeHint')}
                        onPress={() => void removeFriend({ variables: { friendshipId: f.friendshipId } })}
                      />
                    </View>
                    {/* Registration permission toggle */}
                    <Pressable
                      onPress={() =>
                        void setRegPermission({
                          variables: { friendshipId: f.friendshipId, allow: !f.canRegisterMe },
                        })
                      }
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: f.canRegisterMe }}
                      accessibilityLabel={t('friends.canRegisterMe')}
                      hitSlop={8}
                      className="flex-row items-center gap-2 py-2 px-2">
                      <Ionicons
                        name={f.canRegisterMe ? 'checkmark-circle' : 'ellipse-outline'}
                        size={18}
                        color={f.canRegisterMe ? colors.gold : colors.textDim}
                      />
                      <Text variant="micro" className="flex-1">
                        {t('friends.canRegisterMe')}
                      </Text>
                    </Pressable>
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
