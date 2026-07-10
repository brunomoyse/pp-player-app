import type { ClubPlayer } from './identity';

export type PlayerStyle = 'TAG' | 'LAG' | 'TIGHT_PASSIVE' | 'LOOSE_PASSIVE';
export type NoteTagKind = 'TAG' | 'TELL';
/** HUD-style color a player is bucketed into (red = tough, blue = fish, etc.). */
export type NoteColor = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE' | 'PURPLE';

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
    color?: NoteColor | null;
    tags?: PlayerNoteTag[];
  } | null;
}

/** One tablemate at the viewer's live table, with the viewer's note flattened in. */
export interface TableSeatNote {
  clubPlayer: { id: string; displayName: string };
  seatNumber: number;
  stackSize?: number | null;
  note: {
    id: string;
    body: string;
    style?: PlayerStyle | null;
    color?: NoteColor | null;
    tags?: PlayerNoteTag[];
  } | null;
}

/** The viewer's current table: table number, their seat, and their tablemates. */
export interface MyTableView {
  tableNumber: number;
  mySeatNumber?: number | null;
  seats: TableSeatNote[];
}

/** A private note on one opponent. Visible only to its author. */
export interface PlayerNote {
  id: string;
  subjectClubPlayerId: string;
  body: string;
  style?: PlayerStyle | null;
  color?: NoteColor | null;
  createdAt: string;
  updatedAt: string;
  subject?: ClubPlayer | null;
  tags?: PlayerNoteTag[];
  showdownObservations?: ShowdownObservation[];
}
