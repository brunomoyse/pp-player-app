import { useQuery, useSubscription } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { BackButton } from '@/components';
import { PlayerNoteSheet } from '@/components/PlayerNoteSheet';
import { Card, EmptyState, ErrorState, LoadingState, Screen, Text } from '@/components/ui';
import { GET_MY_TABLE_NOTES, TOURNAMENT_SEATING_CHANGES } from '@/graphql/operations';
import { noteColorHex } from '@/lib/noteColors';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';

export default function MyTableScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [openSubject, setOpenSubject] = useState<{ id: string; name?: string } | null>(null);

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_MY_TABLE_NOTES, {
    variables: { tournamentId: id! },
    skip: !isAuth || !id,
    notifyOnNetworkStatusChange: true,
  });

  // Keep the table live as seats change (assigned / moved / busted / restacked).
  useSubscription(TOURNAMENT_SEATING_CHANGES, {
    variables: { tournamentId: id! },
    skip: !isAuth || !id,
    onData: () => void refetch(),
  });

  if (!isAuth) return <Redirect href="/login" />;

  const table = data?.myTableNotes;
  const seats = table?.seats ?? [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('myTable.title')}</Text>
        </View>

        {loading && !data ? (
          <LoadingState label={t('common.loading')} />
        ) : error ? (
          <ErrorState
            message={t('common.errorLoading')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetch()}
          />
        ) : !table ? (
          <EmptyState icon="people-outline" message={t('myTable.notSeated')} />
        ) : (
          <>
            <Text variant="dim">
              {t('myTable.header', {
                table: table.tableNumber,
                seat: table.mySeatNumber ?? '-',
              })}
            </Text>
            <Card className="gap-1 p-2">
              {seats.length === 0 ? (
                <Text variant="dim">{t('myTable.alone')}</Text>
              ) : (
                seats.map((s) => {
                  const dot = noteColorHex(s.note?.color);
                  return (
                  <Pressable
                    key={s.clubPlayer.id}
                    onPress={() =>
                      setOpenSubject({ id: s.clubPlayer.id, name: s.clubPlayer.displayName })
                    }
                    accessibilityRole="button"
                    accessibilityHint={t('myTable.editHint')}
                    className="flex-row items-center gap-3 rounded-xl px-2 py-2">
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: dot ? `${dot}22` : 'rgba(255,255,255,0.05)',
                        borderWidth: dot ? 1.5 : 0,
                        borderColor: dot ?? 'transparent',
                      }}>
                      <Text variant="mono" style={dot ? { color: dot } : undefined} className={dot ? '' : 'text-pp-gold'}>
                        {s.seatNumber}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-pp-text">
                        {s.clubPlayer.displayName}
                      </Text>
                      {s.note?.tags && s.note.tags.length > 0 ? (
                        <Text variant="dim">
                          {s.note.tags.map((tg) => t(`notes.tags.${tg.tag}`, tg.tag)).join(' · ')}
                        </Text>
                      ) : s.note?.body ? (
                        <Text variant="dim" numberOfLines={1} className="text-[12px]">
                          {s.note.body}
                        </Text>
                      ) : (
                        <Text variant="dim">{t('myTable.noNote')}</Text>
                      )}
                    </View>
                    {s.note ? (
                      <View
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: dot ?? colors.gold }}
                      />
                    ) : (
                      <Ionicons name="add-circle-outline" size={18} color={colors.textDim} />
                    )}
                  </Pressable>
                  );
                })
              )}
            </Card>
          </>
        )}

        {openSubject ? (
          <PlayerNoteSheet
            visible={!!openSubject}
            onClose={() => {
              setOpenSubject(null);
              void refetch();
            }}
            subjectId={openSubject.id}
            subjectName={openSubject.name}
            tournamentId={id}
          />
        ) : null}
      </Screen>
    </>
  );
}
