import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { PlayerNoteSheet } from '@/components';
import { Badge, Card, EmptyState, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { GET_MY_PLAYER_NOTES } from '@/graphql/operations';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';

const STYLE_LABEL: Record<string, string> = {
  TAG: 'TAG',
  LAG: 'LAG',
  TIGHT_PASSIVE: 'TP',
  LOOSE_PASSIVE: 'LP',
};

export default function NotesScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const flags = useFeatureFlags();
  const [openSubject, setOpenSubject] = useState<{ id: string; name?: string } | null>(null);

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_MY_PLAYER_NOTES, {
    skip: !isAuth || !flags.notes,
    notifyOnNetworkStatusChange: true,
  });

  if (!isAuth) return <Redirect href="/login" />;

  const notes = data?.myPlayerNotes ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
          </Pressable>
          <Text variant="title">{t('notes.title')}</Text>
        </View>

        {!flags.notes ? (
          <EmptyState message={t('common.notYetAvailable')} />
        ) : loading && !data ? (
          <LoadingState label={t('common.loading')} />
        ) : error ? (
          <ErrorState
            message={t('common.errorLoading')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetch()}
          />
        ) : notes.length === 0 ? (
          <EmptyState message={t('notes.empty')} />
        ) : (
          notes.map((note) => (
            <Pressable
              key={note.id}
              onPress={() =>
                setOpenSubject({
                  id: note.subjectRegisteredPlayerId,
                  name: note.subject?.displayName,
                })
              }>
              <Card className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text variant="heading" className="flex-1">
                    {note.subject?.displayName ?? t('notes.unknownPlayer')}
                  </Text>
                  {note.style ? <Badge label={STYLE_LABEL[note.style] ?? note.style} /> : null}
                </View>
                {note.body ? (
                  <Text variant="muted" numberOfLines={2}>
                    {note.body}
                  </Text>
                ) : null}
                {note.tags && note.tags.length > 0 ? (
                  <Text variant="dim" className="text-[12px]">
                    {note.tags.map((tg) => t(`notes.tags.${tg.tag}`, tg.tag)).join(' · ')}
                  </Text>
                ) : null}
              </Card>
            </Pressable>
          ))
        )}
      </Screen>

      {openSubject ? (
        <PlayerNoteSheet
          visible={!!openSubject}
          onClose={() => {
            setOpenSubject(null);
            void refetch();
          }}
          subjectId={openSubject.id}
          subjectName={openSubject.name}
        />
      ) : null}
    </>
  );
}
