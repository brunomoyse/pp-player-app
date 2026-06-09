import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { QRCodeModal, RegistrationStatusBadge, StatCard } from '@/components';
import { Stagger } from '@/components/motion';
import { Button, Card, EmptyState, ErrorState, LoadingState, Screen, Segment, Text } from '@/components/ui';
import {
  CANCEL_REGISTRATION,
  GET_MY_REGISTRATIONS,
  type MyRegistration,
} from '@/graphql/operations';
import { toast } from '@/lib/toast';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { TournamentStatus } from '@/types/tournament';
import { currencyCents } from '@/utils/currency';
import { formatDateTime } from '@/utils/datetime';

type Category = 'upcoming' | 'live' | 'completed';

const CATEGORY_STATUS: Record<Category, TournamentStatus> = {
  upcoming: 'UPCOMING',
  live: 'IN_PROGRESS',
  completed: 'COMPLETED',
};

export default function MySeatsScreen() {
  const { t, i18n } = useTranslation();
  const isAuth = useIsAuthenticated();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [category, setCategory] = useState<Category>('upcoming');
  const [qrFor, setQrFor] = useState<string | null>(null);

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_MY_REGISTRATIONS, {
    skip: !isAuth,
    notifyOnNetworkStatusChange: true,
  });
  const [cancel] = useMutation(CANCEL_REGISTRATION);

  const regs = useMemo(() => data?.myTournamentRegistrations ?? [], [data]);
  const investment = useMemo(
    () => regs.reduce((sum, r) => sum + (r.tournament.buyInCents ?? 0), 0),
    [regs]
  );
  const upcomingCount = regs.filter((r) => r.tournament.status === 'UPCOMING').length;
  const filtered = regs.filter((r) => r.tournament.status === CATEGORY_STATUS[category]);

  if (!isAuth) return <Redirect href="/login" />;

  const confirmCancel = (reg: MyRegistration) => {
    Alert.alert(
      t('mySeats.cancelConfirmTitle'),
      t('mySeats.cancelConfirmMessage', { name: reg.tournament.title }),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancel({
                variables: { input: { tournamentId: reg.tournamentId, userId: currentUser?.id } },
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

  const segments = (['upcoming', 'live', 'completed'] as Category[]).map((c) => ({
    value: c,
    label: t(`mySeats.categories.${c}`),
  }));

  return (
    <Screen
      refreshing={networkStatus === 4}
      onRefresh={() => void refetch()}
      contentClassName="gap-4">
      <Text variant="title">{t('mySeats.title')}</Text>

      <View className="flex-row gap-3">
        <StatCard icon="ticket-outline" value={regs.length} label={t('mySeats.stats.registered')} />
        <StatCard
          icon="cash-outline"
          value={currencyCents(investment)}
          label={t('mySeats.stats.investment')}
        />
        <StatCard icon="calendar-outline" value={upcomingCount} label={t('mySeats.stats.upcoming')} />
      </View>

      <Segment options={segments} value={category} onChange={setCategory} />

      {loading && !data ? (
        <LoadingState label={t('common.loading')} />
      ) : error ? (
        <ErrorState
          message={t('common.errorLoading')}
          retryLabel={t('common.retry')}
          onRetry={() => void refetch()}
        />
      ) : filtered.length === 0 ? (
        <View className="gap-3">
          <EmptyState icon="ticket-outline" message={t('mySeats.empty.title')} />
          <Button
            title={t('mySeats.empty.browseEvents')}
            variant="secondary"
            onPress={() => router.push('/tournaments')}
          />
        </View>
      ) : (
        <Stagger className="gap-3">
          {filtered.map((reg) => (
            <Pressable key={reg.id} onPress={() => router.push(`/tournament/${reg.tournamentId}`)}>
              <Card className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <Text variant="heading" className="flex-1" numberOfLines={2}>
                    {reg.tournament.title}
                  </Text>
                  <RegistrationStatusBadge status={reg.status} waitlistPosition={reg.waitlistPosition} />
                </View>

                <View className="flex-row flex-wrap gap-x-5 gap-y-2">
                  <Row icon="time-outline" text={formatDateTime(reg.tournament.startTime, i18n.language)} />
                  <Row
                    icon="cash-outline"
                    text={`${t('mySeats.buyIn')} ${currencyCents(reg.tournament.buyInCents)}`}
                  />
                  {reg.waitlistPosition ? (
                    <Row
                      icon="people-outline"
                      text={t('events.waitlistPosition', { position: reg.waitlistPosition })}
                    />
                  ) : null}
                </View>

                {reg.tournament.status === 'UPCOMING' ? (
                  <View className="flex-row gap-2">
                    <Button
                      title={t('mySeats.qrCode.showQR')}
                      variant="secondary"
                      className="flex-1"
                      onPress={() => setQrFor(reg.tournamentId)}
                    />
                    <Button
                      title={t('mySeats.cancel')}
                      variant="danger"
                      className="flex-1"
                      onPress={() => confirmCancel(reg)}
                    />
                  </View>
                ) : null}
              </Card>
            </Pressable>
          ))}
        </Stagger>
      )}

      <QRCodeModal visible={qrFor !== null} tournamentId={qrFor} onClose={() => setQrFor(null)} />
    </Screen>
  );
}

function Row({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text variant="muted" className="text-[13px]">
        {text}
      </Text>
    </View>
  );
}
