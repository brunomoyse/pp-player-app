import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Share, View } from 'react-native';

import { ClockDisplay, PreGameField, PredictionCard, type PredictionPlayer } from '@/components';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { FadeUp } from '@/components/motion';
import { useLiveClock } from '@/hooks/useLiveClock';
import { useLiveRegistrations } from '@/hooks/useLiveRegistrations';
import {
  Badge,
  type BadgeTone,
  Button,
  Card,
  ErrorState,
  LoadingState,
  Screen,
  Text,
} from '@/components/ui';
import {
  GET_TOURNAMENT,
  REGISTER_FOR_TOURNAMENT,
} from '@/graphql/operations';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { TournamentStatus } from '@/types/tournament';
import { currencyCents } from '@/utils/currency';
import { formatDateTime } from '@/utils/datetime';

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

  const tn = data?.tournament;
  const flags = useFeatureFlags();
  // Registered players with display names — the fantasy-prediction picker pool.
  const predictionPlayers = useMemo<PredictionPlayer[]>(
    () =>
      (tn?.registrations ?? [])
        .filter((r) => r.user && r.userId)
        .map((r) => ({ userId: r.userId!, name: r.displayName || r.user?.username || r.user?.firstName || '—' })),
    [tn],
  );
  // Live clock + registration count over the WebSocket (Phase 6).
  const clock = useLiveClock(id, tn?.clock);
  const regCount = useLiveRegistrations(id, tn?.registrations?.length ?? 0);
  const registered = tn?.registrations?.some((r) => r.userId === currentUser?.id) ?? false;

  const onRegister = async () => {
    if (!tn) return;
    if (!isAuth) {
      router.push('/login');
      return;
    }
    try {
      await register({ variables: { input: { tournamentId: tn.id, userId: currentUser?.id } } });
      await refetch();
    } catch {
      // surfaced by error link
    }
  };

  const onShare = () => {
    if (!tn) return;
    void Share.share({ message: `${tn.title} — PocketPair` }).catch(() =>
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
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
          </Pressable>
          {tn ? (
            <Pressable onPress={onShare} accessibilityLabel="Share" hitSlop={8}>
              <Ionicons name="share-outline" size={22} color={colors.textMuted} />
            </Pressable>
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
                  <Badge
                    label={t(`events.status.${tn.status.toLowerCase()}`, tn.status)}
                    tone={STATUS_TONE[tn.status]}
                  />
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
              {tn.club ? (
                <Fact icon="business-outline" label={t('home.selectClub')} value={tn.club.name} />
              ) : null}
            </Card>

            {/* Pre-game prep — who's registered + your notes (Pro). Renders only when eligible. */}
            <PreGameField tournamentId={id!} />

            {/* Fantasy: predict the winner with Prediction Points (G2). */}
            {flags.predictions && tn.status !== 'COMPLETED' ? (
              <PredictionCard tournamentId={id!} players={predictionPlayers} />
            ) : null}

            {/* Live clock (subscription-driven, Phase 6) */}
            {tn.clock ? (
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
                        {s.isBreak ? '—' : `${s.smallBlind}/${s.bigBlind}${s.ante ? ` (${s.ante})` : ''}`}
                      </Text>
                      <Text variant="dim" className="w-16 text-right text-[12px]">
                        {t('events.minutes', { count: s.durationMinutes })}
                      </Text>
                    </View>
                  ))}
                </Card>
              </View>
            ) : null}

            {/* Register CTA */}
            {tn.status === 'UPCOMING' ? (
              <Button
                title={registered ? t('events.onWaitlist') : t('events.register')}
                onPress={onRegister}
                loading={registering}
                disabled={registered}
              />
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
