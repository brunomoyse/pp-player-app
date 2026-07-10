import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { GET_MY_NOTE_COLORS } from '@/graphql/operations';
import { noteColorHex } from '@/lib/noteColors';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import type { NoteColor } from '@/types/notes';

/**
 * The viewer's note color for each player they've tagged, keyed by
 * `clubPlayerId`. Lets any surface that knows a player's clubPlayerId draw a
 * matching ring on their avatar. Cheap + cached (shares the myPlayerNotes cache).
 */
export function useNoteColorMap(): Record<string, NoteColor> {
  const isAuth = useIsAuthenticated();
  const { data } = useQuery(GET_MY_NOTE_COLORS, { skip: !isAuth });

  return useMemo(() => {
    const map: Record<string, NoteColor> = {};
    for (const n of data?.myPlayerNotes ?? []) {
      if (n.color) map[n.subjectClubPlayerId] = n.color;
    }
    return map;
  }, [data]);
}

/** Hex ring color for a player's clubPlayerId, or null if the viewer hasn't
 *  color-tagged them. */
export function useNoteRingColor(clubPlayerId?: string | null): string | null {
  const map = useNoteColorMap();
  return clubPlayerId ? noteColorHex(map[clubPlayerId]) : null;
}
