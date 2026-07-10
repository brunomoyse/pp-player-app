import { gql, type TypedDocumentNode } from '@apollo/client';

import type { MyTableView } from '@/types/notes';

export interface GetMyTableNotesResult {
  myTableNotes: MyTableView | null;
}
export interface GetMyTableNotesVars {
  tournamentId: string;
}

/** Live prep: the players at the viewer's own table, with the viewer's notes. */
export const GET_MY_TABLE_NOTES: TypedDocumentNode<
  GetMyTableNotesResult,
  GetMyTableNotesVars
> = gql`
  query GetMyTableNotes($tournamentId: ID!) {
    myTableNotes(tournamentId: $tournamentId) {
      tableNumber
      mySeatNumber
      seats {
        seatNumber
        stackSize
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
  }
`;
