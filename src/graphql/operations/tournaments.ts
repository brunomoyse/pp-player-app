import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  PlayerStatsResponse,
  RegisterForTournamentInput,
  Tournament,
  TournamentRegistration,
  TournamentStatus,
  UserTournamentResult,
} from '@/types/tournament';

export interface PaginationInput {
  limit?: number;
  offset?: number;
}

export interface Paginated<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  offset: number;
  hasNextPage: boolean;
}

/** Tournament list-row shape (subset of Tournament returned by the list query). */
export type TournamentListItem = Pick<
  Tournament,
  | 'id'
  | 'title'
  | 'description'
  | 'clubId'
  | 'startTime'
  | 'endTime'
  | 'buyInCents'
  | 'rakeCents'
  | 'seatCap'
  | 'status'
  | 'liveStatus'
  | 'createdAt'
  | 'updatedAt'
>;

export interface GetTournamentsResult {
  tournaments: Paginated<TournamentListItem>;
}
export interface GetTournamentsVars {
  clubId?: string | null;
  from?: string | null;
  to?: string | null;
  status?: TournamentStatus | null;
  pagination?: PaginationInput | null;
}

export const GET_TOURNAMENTS: TypedDocumentNode<GetTournamentsResult, GetTournamentsVars> = gql`
  query GetTournaments(
    $clubId: UUID
    $from: DateTime
    $to: DateTime
    $status: TournamentStatus
    $pagination: PaginationInput
  ) {
    tournaments(clubId: $clubId, from: $from, to: $to, status: $status, pagination: $pagination) {
      items {
        id
        title
        description
        clubId
        startTime
        endTime
        buyInCents
        rakeCents
        seatCap
        status
        liveStatus
        createdAt
        updatedAt
      }
      totalCount
      pageSize
      offset
      hasNextPage
    }
  }
`;

export interface GetTournamentResult {
  tournament: Tournament | null;
}
export interface GetTournamentVars {
  id: string;
}

export const GET_TOURNAMENT: TypedDocumentNode<GetTournamentResult, GetTournamentVars> = gql`
  query GetTournament($id: UUID!) {
    tournament(id: $id) {
      id
      title
      description
      startTime
      endTime
      buyInCents
      rakeCents
      seatCap
      status
      liveStatus
      structure {
        id
        tournamentId
        levelNumber
        smallBlind
        bigBlind
        ante
        durationMinutes
        isBreak
        breakDurationMinutes
      }
      clock {
        id
        tournamentId
        status
        currentLevel
        timeRemainingSeconds
        levelStartedAt
        levelEndTime
        totalPauseDurationSeconds
        autoAdvance
        currentStructure {
          id
          levelNumber
          smallBlind
          bigBlind
          ante
          durationMinutes
          isBreak
          breakDurationMinutes
        }
        nextStructure {
          id
          levelNumber
          smallBlind
          bigBlind
          ante
          durationMinutes
          isBreak
          breakDurationMinutes
        }
      }
      registrations {
        id
        userId
        registrationTime
        status
        notes
        user {
          id
          firstName
          username
        }
      }
      club {
        id
        name
        city
      }
    }
  }
`;

export interface GetLeaderboardResult {
  leaderboard: Paginated<LeaderboardEntry>;
}
export interface GetLeaderboardVars {
  period?: LeaderboardPeriod | null;
  pagination?: PaginationInput | null;
  clubId?: string | null;
}

export const GET_LEADERBOARD: TypedDocumentNode<GetLeaderboardResult, GetLeaderboardVars> = gql`
  query GetLeaderboard($period: LeaderboardPeriod, $pagination: PaginationInput, $clubId: UUID) {
    leaderboard(period: $period, pagination: $pagination, clubId: $clubId) {
      items {
        user {
          id
          firstName
          lastName
          username
          email
        }
        rank
        totalTournaments
        totalBuyIns
        totalWinnings
        netProfit
        totalItm
        itmPercentage
        roiPercentage
        averageFinish
        firstPlaces
        finalTables
        points
      }
      totalCount
      pageSize
      offset
      hasNextPage
    }
  }
`;

export interface GetMyStatsResult {
  myTournamentStatistics: PlayerStatsResponse;
}

export const GET_MY_STATISTICS: TypedDocumentNode<GetMyStatsResult, Record<string, never>> = gql`
  query GetMyTournamentStatistics {
    myTournamentStatistics {
      last7Days {
        totalItm
        totalTournaments
        totalWinnings
        totalBuyIns
        itmPercentage
        roiPercentage
      }
      last30Days {
        totalItm
        totalTournaments
        totalWinnings
        totalBuyIns
        itmPercentage
        roiPercentage
      }
      lastYear {
        totalItm
        totalTournaments
        totalWinnings
        totalBuyIns
        itmPercentage
        roiPercentage
      }
    }
  }
`;

export interface GetMyRecentResultsResult {
  myRecentTournamentResults: UserTournamentResult[];
}
export interface GetMyRecentResultsVars {
  limit?: number | null;
}

export const GET_MY_RECENT_RESULTS: TypedDocumentNode<
  GetMyRecentResultsResult,
  GetMyRecentResultsVars
> = gql`
  query GetMyRecentTournamentResults($limit: Int) {
    myRecentTournamentResults(limit: $limit) {
      result {
        id
        tournamentId
        userId
        finalPosition
        prizeCents
        points
        notes
        createdAt
      }
      tournament {
        id
        title
        startTime
        buyInCents
        rakeCents
      }
    }
  }
`;

export interface RegisterForTournamentResult {
  registerForTournament: TournamentRegistration;
}
export interface RegisterForTournamentVars {
  input: RegisterForTournamentInput;
}

export const REGISTER_FOR_TOURNAMENT: TypedDocumentNode<
  RegisterForTournamentResult,
  RegisterForTournamentVars
> = gql`
  mutation RegisterForTournament($input: RegisterForTournamentInput!) {
    registerForTournament(input: $input) {
      id
      tournamentId
      userId
      registrationTime
      status
      notes
    }
  }
`;
