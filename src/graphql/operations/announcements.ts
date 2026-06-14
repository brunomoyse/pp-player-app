import { gql, type TypedDocumentNode } from '@apollo/client';

import type { Paginated, PaginationInput } from './tournaments';

export type AnnouncementScope = 'TOURNAMENT' | 'CLUB' | 'PLATFORM';

export interface Announcement {
  id: string;
  scope: AnnouncementScope;
  clubId?: string | null;
  tournamentId?: string | null;
  title: string;
  body: string;
  createdAt: string;
}

export interface GetMyAnnouncementsResult {
  myAnnouncements: Paginated<Announcement>;
}
export interface GetMyAnnouncementsVars {
  pagination?: PaginationInput | null;
}

// The player's announcement feed: platform announcements, announcements for the
// clubs they belong to, and announcements for tournaments they're registered
// in. Newest first.
export const GET_MY_ANNOUNCEMENTS: TypedDocumentNode<
  GetMyAnnouncementsResult,
  GetMyAnnouncementsVars
> = gql`
  query GetMyAnnouncements($pagination: PaginationInput) {
    myAnnouncements(pagination: $pagination) {
      items {
        id
        scope
        clubId
        tournamentId
        title
        body
        createdAt
      }
      totalCount
      pageSize
      offset
      hasNextPage
    }
  }
`;
