import type { ClubPlayer } from './identity';

export type PlayerStyle = 'TAG' | 'LAG' | 'TIGHT_PASSIVE' | 'LOOSE_PASSIVE';
export type NoteTagKind = 'TAG' | 'TELL';

export interface PlayerNoteTag {
  id: string;
  kind: NoteTagKind;
  tag: string;
}

export interface ShowdownObservation {
  id: string;
  tournamentId?: string | null;
  description: string;
  createdAt: string;
}

/** A player in tonight's field paired with the viewer's note on them (if any). */
export interface FieldPlayerNote {
  clubPlayer: { id: string; displayName: string };
  note: {
    id: string;
    body: string;
    style?: PlayerStyle | null;
    tags?: PlayerNoteTag[];
  } | null;
}

/** A private note on one opponent. Visible only to its author. */
export interface PlayerNote {
  id: string;
  subjectClubPlayerId: string;
  body: string;
  style?: PlayerStyle | null;
  createdAt: string;
  updatedAt: string;
  subject?: ClubPlayer | null;
  tags?: PlayerNoteTag[];
  showdownObservations?: ShowdownObservation[];
}
