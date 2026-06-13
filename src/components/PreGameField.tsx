import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { PlayerNoteSheet } from '@/components/PlayerNoteSheet';
import { Card, Text } from '@/components/ui';
import { GET_TOURNAMENT_FIELD_NOTES } from '@/graphql/operations';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useIsPro } from '@/hooks/useIsPro';
import { colors } from '@/theme/tokens';

/**
 * Pre-game prep (the Pro demo moment): everyone registered for a tournament,
 * with the viewer's own notes auto-surfaced. Renders nothing unless the viewer
 * is Pro and the notes feature is on.
 */
export function PreGameField({ tournamentId }: { tournamentId: string }) {
  const { t } = useTranslation();
  const flags = useFeatureFlags();
  const isPro = useIsPro();
  const eligible = flags.notes && isPro;
  const [openSubject, setOpenSubject] = useState<{ id: string; name?: string } | null>(null);

  const { data, refetch } = useQuery(GET_TOURNAMENT_FIELD_NOTES, {
    variables: { tournamentId },
    skip: !eligible,
  });

  if (!eligible) return null;

  const field = data?.tournamentFieldNotes ?? [];
  if (field.length === 0) return null;

  const noted = field.filter((f) => f.note).length;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text variant="heading">{t('notes.whosHere')}</Text>
        <Text variant="dim">
          {t('notes.notedCount', { noted, total: field.length })}
        </Text>
      </View>
      <Card className="gap-1 p-2">
        {field.map((f) => (
          <Pressable
            key={f.clubPlayer.id}
            onPress={() =>
              setOpenSubject({ id: f.clubPlayer.id, name: f.clubPlayer.displayName })
            }
            className="flex-row items-center gap-3 rounded-xl px-2 py-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-white/5">
              <Ionicons
                name={f.note ? 'document-text' : 'person-outline'}
                size={15}
                color={f.note ? colors.gold : colors.textDim}
              />
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-pp-text">
                {f.clubPlayer.displayName}
              </Text>
              {f.note?.tags && f.note.tags.length > 0 ? (
                <Text variant="dim">
                  {f.note.tags.map((tg) => t(`notes.tags.${tg.tag}`, tg.tag)).join(' · ')}
                </Text>
              ) : f.note?.body ? (
                <Text variant="dim" numberOfLines={1} className="text-[12px]">
                  {f.note.body}
                </Text>
              ) : null}
            </View>
            {f.note ? <View className="h-2 w-2 rounded-full bg-pp-gold" /> : null}
          </Pressable>
        ))}
      </Card>

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
    </View>
  );
}
