import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  FieldPlayerNote,
  NoteTagKind,
  PlayerNote,
  PlayerNoteTag,
  PlayerStyle,
  ShowdownObservation,
} from '@/types/notes';

const NOTE_FIELDS = `
  id
  subjectClubPlayerId
  body
  style
  createdAt
  updatedAt
  subject {
    id
    clubId
    displayName
  }
  tags {
    id
    kind
    tag
  }
  showdownObservations {
    id
    tournamentId
    description
    createdAt
  }
`;

export interface GetPlayerNoteResult {
  playerNote: PlayerNote | null;
}
export interface GetPlayerNoteVars {
  subjectClubPlayerId: string;
}

export const GET_PLAYER_NOTE: TypedDocumentNode<GetPlayerNoteResult, GetPlayerNoteVars> = gql`
  query GetPlayerNote($subjectClubPlayerId: ID!) {
    playerNote(subjectClubPlayerId: $subjectClubPlayerId) {${NOTE_FIELDS}}
  }
`;

export interface GetTournamentFieldNotesResult {
  tournamentFieldNotes: FieldPlayerNote[];
}
export interface GetTournamentFieldNotesVars {
  tournamentId: string;
}

/** Pre-game prep: tonight's field with the viewer's notes attached. */
export const GET_TOURNAMENT_FIELD_NOTES: TypedDocumentNode<
  GetTournamentFieldNotesResult,
  GetTournamentFieldNotesVars
> = gql`
  query GetTournamentFieldNotes($tournamentId: ID!) {
    tournamentFieldNotes(tournamentId: $tournamentId) {
      clubPlayer {
        id
        displayName
      }
      note {
        id
        body
        style
        tags {
          id
          kind
          tag
        }
      }
    }
  }
`;

export interface GetMyPlayerNotesResult {
  myPlayerNotes: PlayerNote[];
}

export const GET_MY_PLAYER_NOTES: TypedDocumentNode<
  GetMyPlayerNotesResult,
  Record<string, never>
> = gql`
  query GetMyPlayerNotes {
    myPlayerNotes {${NOTE_FIELDS}}
  }
`;

export interface UpsertPlayerNoteResult {
  upsertPlayerNote: PlayerNote;
}
export interface UpsertPlayerNoteVars {
  input: {
    subjectClubPlayerId: string;
    body?: string | null;
    style?: PlayerStyle | null;
  };
}

export const UPSERT_PLAYER_NOTE: TypedDocumentNode<
  UpsertPlayerNoteResult,
  UpsertPlayerNoteVars
> = gql`
  mutation UpsertPlayerNote($input: UpsertPlayerNoteInput!) {
    upsertPlayerNote(input: $input) {${NOTE_FIELDS}}
  }
`;

export interface DeletePlayerNoteResult {
  deletePlayerNote: boolean;
}
export interface DeletePlayerNoteVars {
  noteId: string;
}

export const DELETE_PLAYER_NOTE: TypedDocumentNode<
  DeletePlayerNoteResult,
  DeletePlayerNoteVars
> = gql`
  mutation DeletePlayerNote($noteId: ID!) {
    deletePlayerNote(noteId: $noteId)
  }
`;

export interface AddPlayerNoteTagResult {
  addPlayerNoteTag: PlayerNoteTag;
}
export interface AddPlayerNoteTagVars {
  input: { noteId: string; kind: NoteTagKind; tag: string };
}

export const ADD_PLAYER_NOTE_TAG: TypedDocumentNode<
  AddPlayerNoteTagResult,
  AddPlayerNoteTagVars
> = gql`
  mutation AddPlayerNoteTag($input: AddPlayerNoteTagInput!) {
    addPlayerNoteTag(input: $input) {
      id
      kind
      tag
    }
  }
`;

export interface RemovePlayerNoteTagResult {
  removePlayerNoteTag: boolean;
}
export interface RemovePlayerNoteTagVars {
  noteId: string;
  tagId: string;
}

export const REMOVE_PLAYER_NOTE_TAG: TypedDocumentNode<
  RemovePlayerNoteTagResult,
  RemovePlayerNoteTagVars
> = gql`
  mutation RemovePlayerNoteTag($noteId: ID!, $tagId: ID!) {
    removePlayerNoteTag(noteId: $noteId, tagId: $tagId)
  }
`;

export interface AddShowdownObservationResult {
  addShowdownObservation: ShowdownObservation;
}
export interface AddShowdownObservationVars {
  input: { noteId: string; tournamentId?: string | null; description: string };
}

export const ADD_SHOWDOWN_OBSERVATION: TypedDocumentNode<
  AddShowdownObservationResult,
  AddShowdownObservationVars
> = gql`
  mutation AddShowdownObservation($input: AddShowdownObservationInput!) {
    addShowdownObservation(input: $input) {
      id
      tournamentId
      description
      createdAt
    }
  }
`;
