import { gql, type TypedDocumentNode } from '@apollo/client';

import type { Club } from '@/types/user';

export interface GetClubsResult {
  clubs: Club[];
}

export const GET_CLUBS: TypedDocumentNode<GetClubsResult, Record<string, never>> = gql`
  query GetClubs {
    clubs {
      id
      name
      city
    }
  }
`;
