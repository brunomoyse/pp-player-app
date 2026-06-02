import { useQuery } from '@apollo/client/react';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ClubSelector, TournamentCard } from '@/components';
import { Stagger } from '@/components/motion';
import { EmptyState, ErrorState, Input, LoadingState, Screen, Segment, Text } from '@/components/ui';
import { GET_TOURNAMENTS, type TournamentListItem } from '@/graphql/operations';
import { useClubs } from '@/hooks/useClubs';
import { useClubStore } from '@/stores/useClubStore';
import type { TournamentStatus } from '@/types/tournament';

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
  const [category, setCategory] = useState<Category>('upcoming');
  const [search, setSearch] = useState('');

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_TOURNAMENTS, {
    variables: { clubId: selectedClub?.id ?? null, pagination: { limit: 50, offset: 0 } },
    notifyOnNetworkStatusChange: true,
  });

  const items = data?.tournaments.items ?? [];
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
  );
}
