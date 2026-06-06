import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { ClubSelector, QRCodeScanner, TournamentCard } from '@/components';
import { Stagger } from '@/components/motion';
import { EmptyState, ErrorState, Input, LoadingState, Screen, Segment, Text } from '@/components/ui';
import {
  GET_MY_ATTENDANCE_STREAK,
  GET_TOURNAMENTS,
  RECORD_CHECK_IN,
  SELF_CHECK_IN,
  type TournamentListItem,
} from '@/graphql/operations';
import { useClubs } from '@/hooks/useClubs';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { useClubStore } from '@/stores/useClubStore';
import { colors } from '@/theme/tokens';
import type { TournamentStatus } from '@/types/tournament';
import type { ParsedQRCode } from '@/utils/qrCodeRouter';

type Category = 'upcoming' | 'live' | 'completed';

const CATEGORY_STATUS: Record<Category, TournamentStatus> = {
  upcoming: 'UPCOMING',
  live: 'IN_PROGRESS',
  completed: 'COMPLETED',
};

export default function TournamentsScreen() {
  const { t } = useTranslation();
  useClubs();
  const selectedClub = useClubStore((s) => s.selectedClub);
  const isAuth = useIsAuthenticated();
  const [category, setCategory] = useState<Category>('upcoming');
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [selfCheckIn] = useMutation(SELF_CHECK_IN);
  const [recordCheckIn] = useMutation(RECORD_CHECK_IN, {
    refetchQueries: [{ query: GET_MY_ATTENDANCE_STREAK }],
  });

  const onScanned = async (parsed: ParsedQRCode) => {
    setScanning(false);
    if (parsed.type === 'tournament') {
      router.push(`/tournament/${parsed.payload}`);
    } else if (parsed.type === 'checkin') {
      if (!isAuth) {
        router.push('/login');
        return;
      }
      try {
        const { data: res } = await selfCheckIn({ variables: { input: { tournamentId: parsed.payload } } });
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Advance the attendance streak — the dopamine moment.
        let title = t('qrScanner.checkInSuccess');
        let message = res?.selfCheckIn.message ?? '';
        try {
          const { data: streakRes } = await recordCheckIn({
            variables: { tournamentId: parsed.payload },
          });
          const r = streakRes?.recordCheckIn;
          if (r && !r.alreadyCheckedIn) {
            const count = r.streak.currentStreak;
            if (r.isComeback) {
              title = t('streak.comebackTitle');
              message = t('streak.comebackMessage', { count });
            } else if (r.isNewLongest) {
              title = t('streak.newBestTitle');
              message = t('streak.newBestMessage', { count });
            } else if (r.freezeUsed) {
              title = t('streak.frozenTitle');
              message = t('streak.frozenMessage', { count });
            } else {
              title = t('streak.advancedTitle');
              message = t('streak.advancedMessage', { count });
            }
          }
        } catch {
          // Streak bookkeeping is best-effort; the check-in already succeeded.
        }
        Alert.alert(title, message);
      } catch {
        Alert.alert(t('qrScanner.checkInFailed'), t('qrScanner.checkInFailedMessage'));
      }
    } else {
      Alert.alert(t('qrScanner.unknownQR'), t('qrScanner.unknownQRMessage'));
    }
  };

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_TOURNAMENTS, {
    variables: { clubId: selectedClub?.id ?? null, pagination: { limit: 50, offset: 0 } },
    notifyOnNetworkStatusChange: true,
  });

  const items = useMemo(() => data?.tournaments.items ?? [], [data]);
  const filtered = useMemo(() => {
    const wanted = CATEGORY_STATUS[category];
    const q = search.trim().toLowerCase();
    return items
      .filter((tn) => tn.status === wanted)
      .filter((tn) => !q || tn.title.toLowerCase().includes(q));
  }, [items, category, search]);

  const segments = (['upcoming', 'live', 'completed'] as Category[]).map((c) => ({
    value: c,
    label: t(`events.categories.${c}`),
  }));

  return (
    <View className="flex-1 bg-pp-bg">
    <Screen
      refreshing={networkStatus === 4}
      onRefresh={() => void refetch()}
      contentClassName="gap-4">
      <Text variant="title">{t('events.title')}</Text>
      <ClubSelector />
      <Input
        placeholder={t('events.search.placeholder')}
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
      />
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
        <EmptyState icon="calendar-outline" message={t('events.empty.title')} />
      ) : (
        <Stagger className="gap-3">
          {filtered.map((tn: TournamentListItem) => (
            <TournamentCard
              key={tn.id}
              tournament={{ ...tn, registrations: [] }}
              onPress={() => router.push(`/tournament/${tn.id}`)}
            />
          ))}
        </Stagger>
      )}
    </Screen>

      {/* Scan-to-check-in FAB */}
      <Pressable
        onPress={() => setScanning(true)}
        accessibilityRole="button"
        accessibilityLabel={t('qrScanner.scanTournament')}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-pp-gold"
        style={{ elevation: 6 }}>
        <Ionicons name="qr-code-outline" size={24} color={colors.bg} />
      </Pressable>

      <QRCodeScanner visible={scanning} onClose={() => setScanning(false)} onScanned={onScanned} />
    </View>
  );
}
