import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Button, Chip, IconButton, Input, LoadingState, Segment, Text } from '@/components/ui';
import {
  ADD_PLAYER_NOTE_TAG,
  ADD_SHOWDOWN_OBSERVATION,
  GET_PLAYER_NOTE,
  REMOVE_PLAYER_NOTE_TAG,
  UPSERT_PLAYER_NOTE,
} from '@/graphql/operations';
import type { PlayerNote, PlayerStyle } from '@/types/notes';

export interface PlayerNoteSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The club_player this note is about. */
  subjectId: string;
  subjectName?: string;
  /** When opened from a live tournament, tags new showdowns to it. */
  tournamentId?: string;
}

const STYLE_OPTIONS: { value: PlayerStyle; label: string }[] = [
  { value: 'TAG', label: 'TAG' },
  { value: 'LAG', label: 'LAG' },
  { value: 'TIGHT_PASSIVE', label: 'TP' },
  { value: 'LOOSE_PASSIVE', label: 'LP' },
];

// Structured quick tags (i18n keys under notes.tags.*).
const TAG_PRESETS = [
  'tight',
  'loose',
  'aggressive',
  'passive',
  'station',
  'maniac',
  'rock',
  'tricky',
];

export function PlayerNoteSheet({
  visible,
  onClose,
  subjectId,
  subjectName,
  tournamentId,
}: PlayerNoteSheetProps) {
  const { t } = useTranslation();
  const { data, loading, refetch } = useQuery(GET_PLAYER_NOTE, {
    variables: { subjectClubPlayerId: subjectId },
    skip: !visible,
  });
  const note = data?.playerNote ?? null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(10,10,12,0.6)' }}>
        <View
          onStartShouldSetResponder={() => true}
          accessibilityViewIsModal
          className="max-h-[88%] rounded-t-2xl border-t border-pp-border bg-pp-surface pb-8 pt-4">
          <View className="mb-3 flex-row items-center justify-between px-5">
            <View className="flex-1">
              <Text variant="heading">{subjectName ?? t('notes.title')}</Text>
              <Text variant="micro">{t('notes.privateSubtitle')}</Text>
            </View>
            <IconButton name="close" size={22} accessibilityLabel={t('common.close')} onPress={onClose} />
          </View>

          {loading && !data ? (
            <View className="px-5 py-8">
              <LoadingState label={t('common.loading')} />
            </View>
          ) : (
            // Remount the form when the underlying note identity changes so initial
            // values come straight from props — no prop→state effect needed.
            <NoteForm
              key={note?.id ?? 'new'}
              note={note}
              subjectId={subjectId}
              tournamentId={tournamentId}
              onClose={onClose}
              refetch={() => void refetch()}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

interface NoteFormProps {
  note: PlayerNote | null;
  subjectId: string;
  tournamentId?: string;
  onClose: () => void;
  refetch: () => void;
}

function NoteForm({ note, subjectId, tournamentId, onClose, refetch }: NoteFormProps) {
  const { t } = useTranslation();
  const [body, setBody] = useState(note?.body ?? '');
  const [style, setStyle] = useState<PlayerStyle | null>(note?.style ?? null);
  const [showdown, setShowdown] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [upsert, { loading: saving }] = useMutation(UPSERT_PLAYER_NOTE);
  const [addTag] = useMutation(ADD_PLAYER_NOTE_TAG);
  const [removeTag] = useMutation(REMOVE_PLAYER_NOTE_TAG);
  const [addShowdown] = useMutation(ADD_SHOWDOWN_OBSERVATION);

  // Ensure a note row exists (tags/showdowns need a note id), returning it.
  async function ensureNoteId(): Promise<string | null> {
    if (note?.id) return note.id;
    try {
      const res = await upsert({
        variables: { input: { subjectClubPlayerId: subjectId, body, style } },
      });
      refetch();
      return res.data?.upsertPlayerNote.id ?? null;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    }
  }

  async function save() {
    setError(null);
    try {
      await upsert({
        variables: { input: { subjectClubPlayerId: subjectId, body, style } },
      });
      refetch();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function toggleTag(tag: string) {
    const existing = note?.tags?.find((tg) => tg.tag === tag);
    const noteId = await ensureNoteId();
    if (!noteId) return;
    if (existing) {
      await removeTag({ variables: { noteId, tagId: existing.id } });
    } else {
      await addTag({ variables: { input: { noteId, kind: 'TAG', tag } } });
    }
    refetch();
  }

  async function submitShowdown() {
    const description = showdown.trim();
    if (!description) return;
    const noteId = await ensureNoteId();
    if (!noteId) return;
    await addShowdown({ variables: { input: { noteId, tournamentId, description } } });
    setShowdown('');
    refetch();
  }

  const activeTags = new Set((note?.tags ?? []).map((tg) => tg.tag));

  return (
    <ScrollView contentContainerClassName="gap-4 px-5 pt-1">
      {/* Style quadrant */}
      <View className="gap-1.5">
        <Text variant="label" className="text-pp-text-muted">
          {t('notes.style')}
        </Text>
        <Segment options={STYLE_OPTIONS} value={style ?? 'TAG'} onChange={(v) => setStyle(v)} />
      </View>

      {/* Quick tags */}
      <View className="gap-1.5">
        <Text variant="label" className="text-pp-text-muted">
          {t('notes.tagsLabel')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {TAG_PRESETS.map((tag) => (
            <Chip
              key={tag}
              label={t(`notes.tags.${tag}`)}
              active={activeTags.has(tag)}
              onPress={() => void toggleTag(tag)}
            />
          ))}
        </View>
      </View>

      {/* Free-form note */}
      <Input
        label={t('notes.bodyLabel')}
        value={body}
        onChangeText={setBody}
        placeholder={t('notes.bodyPlaceholder')}
        multiline
        className="min-h-[96px]"
        style={{ textAlignVertical: 'top' }}
      />

      {/* Showdown observations */}
      <View className="gap-2">
        <Text variant="label" className="text-pp-text-muted">
          {t('notes.showdownLabel')}
        </Text>
        {(note?.showdownObservations ?? []).map((obs) => (
          <View
            key={obs.id}
            className="rounded-xl border border-pp-border bg-pp-surface-2 px-3 py-2">
            <Text className="text-[13px] text-pp-text">{obs.description}</Text>
          </View>
        ))}
        <View className="flex-row items-end gap-2">
          <View className="flex-1">
            <Input
              value={showdown}
              onChangeText={setShowdown}
              placeholder={t('notes.showdownPlaceholder')}
            />
          </View>
          <Button
            title={t('notes.add')}
            variant="secondary"
            onPress={() => void submitShowdown()}
          />
        </View>
      </View>

      {error ? (
        <Text className="text-xs text-pp-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Button
        title={saving ? t('notes.saving') : t('notes.save')}
        onPress={() => void save()}
        disabled={saving}
        className="mt-1"
      />
    </ScrollView>
  );
}
