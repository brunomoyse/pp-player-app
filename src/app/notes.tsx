import { useQuery } from '@apollo/client/react';
import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { BackButton, PlayerNoteSheet } from '@/components';
import { Badge, Card, EmptyState, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { GET_MY_PLAYER_NOTES } from '@/graphql/operations';
import { noteColorHex } from '@/lib/noteColors';
import { useIsAuthenticated } from '@/stores/useAuthStore';

const STYLE_LABEL: Record<string, string> = {
  TAG: 'TAG',
  LAG: 'LAG',
  TIGHT_PASSIVE: 'TP',
  LOOSE_PASSIVE: 'LP',
};

export default function NotesScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const [openSubject, setOpenSubject] = useState<{ id: string; name?: string } | null>(null);

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_MY_PLAYER_NOTES, {
    skip: !isAuth,
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
          <BackButton />
          <Text variant="title">{t('notes.title')}</Text>
        </View>

        {loading && !data ? (
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
          notes.map((note) => {
            const hex = noteColorHex(note.color);
            return (
            <Pressable
              key={note.id}
              onPress={() =>
                setOpenSubject({
                  id: note.subjectClubPlayerId,
                  name: note.subject?.displayName,
                })
              }>
              <Card
                className="gap-2"
                style={hex ? { borderLeftWidth: 3, borderLeftColor: hex } : undefined}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center gap-2">
                    {hex ? (
                      <View
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: hex }}
                      />
                    ) : null}
                    <Text variant="heading" className="flex-1">
                      {note.subject?.displayName ?? t('notes.unknownPlayer')}
                    </Text>
                  </View>
                  {note.style ? <Badge label={STYLE_LABEL[note.style] ?? note.style} /> : null}
                </View>
                {note.body ? (
                  <Text variant="muted" numberOfLines={2}>
                    {note.body}
                  </Text>
                ) : null}
                {note.tags && note.tags.length > 0 ? (
                  <Text variant="dim">
                    {note.tags.map((tg) => t(`notes.tags.${tg.tag}`, tg.tag)).join(' · ')}
                  </Text>
                ) : null}
              </Card>
            </Pressable>
            );
          })
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
