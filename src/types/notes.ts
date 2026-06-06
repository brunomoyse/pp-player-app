import type { RegisteredPlayer } from './identity';

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

/** A private note on one opponent. Visible only to its author. */
export interface PlayerNote {
  id: string;
  subjectRegisteredPlayerId: string;
  body: string;
  style?: PlayerStyle | null;
  createdAt: string;
  updatedAt: string;
  subject?: RegisteredPlayer | null;
  tags?: PlayerNoteTag[];
  showdownObservations?: ShowdownObservation[];
}
