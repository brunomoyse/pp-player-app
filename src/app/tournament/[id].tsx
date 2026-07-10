import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Share, View } from 'react-native';

import { BackButton, ClockDisplay, PreGameField, RegistrationStatusBadge } from '@/components';
import { FadeUp } from '@/components/motion';
import { useLiveClock } from '@/hooks/useLiveClock';
import { useLiveRegistrations } from '@/hooks/useLiveRegistrations';
import {
  Badge,
  type BadgeTone,
  Button,
  Card,
  ErrorState,
  IconButton,
  LoadingState,
  Screen,
  Text,
} from '@/components/ui';
import {
  CANCEL_REGISTRATION,
  GET_TOURNAMENT,
  GET_TOURNAMENT_ENTRY_STATS,
  REGISTER_FOR_TOURNAMENT,
} from '@/graphql/operations';
import { toast } from '@/lib/toast';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { TournamentStatus } from '@/types/tournament';
import { currencyCents } from '@/utils/currency';
import { formatDateTime } from '@/utils/datetime';

const KEEP_AWAKE_TAG = 'tournament-live-clock';

const STATUS_TONE: Record<TournamentStatus, BadgeTone> = {
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'live',
  COMPLETED: 'completed',
};

export default function TournamentDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAuth = useIsAuthenticated();
  const currentUser = useAuthStore((s) => s.currentUser);

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_TOURNAMENT, {
    variables: { id: id! },
    skip: !id,
    notifyOnNetworkStatusChange: true,
  });
  const [register, { loading: registering }] = useMutation(REGISTER_FOR_TOURNAMENT);
  const [cancel, { loading: cancelling }] = useMutation(CANCEL_REGISTRATION);

  const tn = data?.tournament;

  // Live entry stats (chips in play, players left) — only meaningful while running.
  const { data: statsData } = useQuery(GET_TOURNAMENT_ENTRY_STATS, {
    variables: { tournamentId: id! },
    skip: !id || tn?.status !== 'IN_PROGRESS',
    pollInterval: 30_000,
  });
  const stats = statsData?.tournamentEntryStats;
  // PKO / bounty format and the carried-over progressive-knockout head.
  const isBounty = !!tn?.bountyType && tn.bountyType !== 'NONE';
  // No chips in play (e.g. nobody checked in yet) means the stat is unknown,
  // not an average of zero — hide the row rather than showing "0".
  const totalChips = Number(stats?.totalChips ?? 0);
  const avgStack =
    stats && stats.playersRemaining && stats.playersRemaining > 0 && totalChips > 0
      ? Math.round(totalChips / stats.playersRemaining)
      : null;
  // Live clock + registration count over the WebSocket (Phase 6).
  const clock = useLiveClock(id, tn?.clock);

  // Keep the screen on while the clock is running — players leave this screen
  // face-up at the table and the device must not lock mid-level.
  useEffect(() => {
    if (!clock.isLive) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [clock.isLive]);
  const regCount = useLiveRegistrations(id, tn?.registrations?.length ?? 0);
  // The viewer's active registration, if any (cancelled/no-show don't count —
  // they should be able to register again).
  const myRegistration = tn?.registrations?.find(
    (r) => r.userId === currentUser?.id && r.status !== 'CANCELLED' && r.status !== 'NO_SHOW'
  );

  const onRegister = async () => {
    if (!tn) return;
    if (!isAuth) {
      router.push('/login');
      return;
    }
    try {
      const result = await register({
        variables: { input: { tournamentId: tn.id, userId: currentUser?.id } },
      });
      await refetch();
      const reg = result.data?.registerForTournament;
      if (reg?.status === 'WAITLISTED') {
        toast.info(
          reg.waitlistPosition
            ? t('events.toast.waitlistedPosition', { position: reg.waitlistPosition })
            : t('events.toast.waitlisted')
        );
      } else {
        toast.success(t('events.toast.registered'));
      }
    } catch {
      toast.error(t('events.toast.registerFailed'));
    }
  };

  const onUnregister = () => {
    if (!tn) return;
    Alert.alert(
      t('mySeats.cancelConfirmTitle'),
      t('mySeats.cancelConfirmMessage', { name: tn.title }),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancel({
                variables: { input: { tournamentId: tn.id, userId: currentUser?.id } },
              });
              await refetch();
              toast.success(t('events.toast.cancelled'));
            } catch {
              toast.error(t('events.toast.cancelFailed'));
            }
          },
        },
      ]
    );
  };

  const onShare = () => {
    if (!tn) return;
    void Share.share({ message: `${tn.title} - PocketPair` }).catch(() =>
      Alert.alert(t('common.notYetAvailable'))
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center justify-between">
          <BackButton />
          {tn ? (
            <IconButton
              name="share-outline"
              size={22}
              accessibilityLabel={t('common.share')}
              onPress={onShare}
            />
          ) : null}
        </View>

        {loading && !data ? (
          <LoadingState label={t('events.loadingDetails')} />
        ) : error || !tn ? (
          <ErrorState
            message={t('common.errorLoading')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            <FadeUp>
              <View className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <Text variant="title" className="flex-1">
                    {tn.title}
                  </Text>
                  <View className="items-end gap-1">
                    <Badge
                      label={t(`events.status.${tn.status.toLowerCase()}`, tn.status)}
                      tone={STATUS_TONE[tn.status]}
                    />
                    {isBounty ? <Badge label={t('events.pko')} tone="bounty" /> : null}
                  </View>
                </View>
                {tn.description ? <Text variant="muted">{tn.description}</Text> : null}
              </View>
            </FadeUp>

            {/* Key facts */}
            <Card className="gap-3">
              <Fact icon="time-outline" label={t('events.dateTime')} value={formatDateTime(tn.startTime, i18n.language)} />
              <Fact icon="cash-outline" label={t('events.buyIn')} value={currencyCents(tn.buyInCents)} />
              <Fact
                icon="people-outline"
                label={t('events.players')}
                value={tn.seatCap ? `${regCount} / ${tn.seatCap}` : `${regCount}`}
              />
              {isBounty ? (
                <Fact
                  icon="skull-outline"
                  label={t('events.bounty.perKnockout')}
                  value={currencyCents(tn.bountyAmountCents ?? 0)}
                />
              ) : null}
              {tn.status === 'IN_PROGRESS' && stats?.playersRemaining != null ? (
                <Fact
                  icon="person-outline"
                  label={t('events.playersLeft')}
                  value={`${stats.playersRemaining}`}
                />
              ) : null}
              {tn.status === 'IN_PROGRESS' && avgStack != null ? (
                <Fact
                  icon="layers-outline"
                  label={t('events.averageStack')}
                  value={avgStack.toLocaleString(i18n.language)}
                />
              ) : null}
              {tn.club ? (
                <Fact icon="business-outline" label={t('events.club')} value={tn.club.name} />
              ) : null}
            </Card>

            {/* Day 2 qualification — survived a flight, carrying a stack into the final day. */}
            {tn.isFinalDay && myRegistration?.startingStack != null ? (
              <FadeUp>
                <Card className="flex-row items-center gap-3 border border-pp-gold/40 bg-pp-gold/10">
                  <Ionicons name="trophy" size={24} color={colors.gold} />
                  <View className="flex-1">
                    <Text variant="heading" className="text-pp-gold">
                      {t('events.qualifiedForDay2Title')}
                    </Text>
                    <Text variant="muted">
                      {t('events.qualifiedForDay2Body', {
                        chipCount: myRegistration.startingStack.toLocaleString(i18n.language),
                      })}
                    </Text>
                  </View>
                </Card>
              </FadeUp>
            ) : null}

            {/* Progressive knockout — your live bounty head, climbs with each elimination. */}
            {tn.bountyType === 'PROGRESSIVE' &&
            myRegistration?.currentBountyCents != null &&
            myRegistration.currentBountyCents > 0 ? (
              <FadeUp>
                <Card className="flex-row items-center gap-3 border border-pp-gold/40 bg-pp-gold/10">
                  <Ionicons name="skull-outline" size={24} color={colors.gold} />
                  <View className="flex-1">
                    <Text variant="heading" className="text-pp-gold">
                      {t('events.bounty.yourBountyTitle')}
                    </Text>
                    <Text variant="muted">
                      {t('events.bounty.yourBountyBody', {
                        amount: currencyCents(myRegistration.currentBountyCents),
                      })}
                    </Text>
                  </View>
                </Card>
              </FadeUp>
            ) : null}

            {/* Final results — finishing order, prizes and (PKO) knockout feed. */}
            {tn.status === 'COMPLETED' ? (
              <Button
                title={t('events.viewFinalResults')}
                variant="secondary"
                onPress={() => router.push(`/tournament/${id}/results`)}
              />
            ) : null}

            {/* Once seated, focus on the viewer's own table; before that, the
                whole field is the useful view. */}
            {myRegistration?.status === 'SEATED' ? (
              <Pressable
                onPress={() => router.push(`/tournament/${id}/table`)}
                accessibilityRole="button"
                accessibilityHint={t('myTable.openHint')}>
                <Card className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <Ionicons name="people-outline" size={20} color={colors.gold} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-pp-text">{t('myTable.title')}</Text>
                    <Text variant="dim">{t('myTable.cta')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
                </Card>
              </Pressable>
            ) : (
              <PreGameField tournamentId={id!} />
            )}

            {/* Live clock (subscription-driven, Phase 6) — pointless once the tournament is over. */}
            {tn.status !== 'COMPLETED' && tn.clock ? (
              <ClockDisplay
                isLive={clock.isLive}
                timeRemaining={clock.timeRemaining}
                currentLevel={clock.currentLevel}
                nextLevel={clock.nextLevel}
              />
            ) : null}

            {/* Blind structure */}
            {tn.structure?.length ? (
              <View className="gap-2">
                <Text variant="heading">{t('events.blindsStructure')}</Text>
                <Card className="gap-1 p-2">
                  {tn.structure.map((s) => (
                    <View
                      key={s.id}
                      className="flex-row items-center justify-between rounded-xl px-2 py-2">
                      <Text variant="muted" className="w-16">
                        {s.isBreak ? t('events.break') : `${t('events.level')} ${s.levelNumber}`}
                      </Text>
                      <Text variant="mono" className="flex-1 text-center text-pp-text">
                        {s.isBreak ? '-' : `${s.smallBlind}/${s.bigBlind}${s.ante ? ` (${s.ante})` : ''}`}
                      </Text>
                      <Text variant="dim" className="w-16 text-right text-[12px]">
                        {t('events.minutes', { count: s.durationMinutes })}
                      </Text>
                    </View>
                  ))}
                </Card>
              </View>
            ) : null}

            {/* Register / unregister CTA */}
            {tn.status === 'UPCOMING' ? (
              myRegistration ? (
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text variant="muted">{t('events.yourStatus')}</Text>
                    <RegistrationStatusBadge
                      status={myRegistration.status}
                      waitlistPosition={myRegistration.waitlistPosition}
                    />
                  </View>
                  <Button
                    title={t('events.unregister')}
                    variant="danger"
                    onPress={onUnregister}
                    loading={cancelling}
                    testID="unregister-cta"
                  />
                </View>
              ) : (
                <Button
                  title={t('events.register')}
                  onPress={onRegister}
                  loading={registering}
                  testID="register-cta"
                />
              )
            ) : null}
          </>
        )}
      </Screen>
    </>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={18} color={colors.gold} />
      <Text variant="muted" className="flex-1">
        {label}
      </Text>
      <Text className="font-sans-semibold text-pp-text">{value}</Text>
    </View>
  );
}
