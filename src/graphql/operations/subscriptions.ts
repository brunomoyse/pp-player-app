import { gql, type TypedDocumentNode } from '@apollo/client';

import type { TournamentClock } from '@/types/clock';
import type { RegistrationStatus } from '@/types/tournament';
import type { UserNotification } from '@/types/user';

export interface ClockUpdatesResult {
  tournamentClockUpdates: TournamentClock;
}
export interface ClockUpdatesVars {
  tournamentId: string;
}

export const TOURNAMENT_CLOCK_UPDATES: TypedDocumentNode<ClockUpdatesResult, ClockUpdatesVars> = gql`
  subscription TournamentClockUpdates($tournamentId: ID!) {
    tournamentClockUpdates(tournamentId: $tournamentId) {
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
  }
`;

export type RegistrationEventType = 'REGISTERED' | 'CANCELLED' | 'WAITLISTED' | 'PROMOTED' | 'CHECKED_IN';

export interface RegistrationEvent {
  tournamentId: string;
  eventType: RegistrationEventType;
  player: {
    user: { id: string; firstName?: string | null; lastName?: string | null; username?: string | null; email?: string | null };
    registration: { id: string; registrationTime: string; status: RegistrationStatus; notes?: string | null };
  };
}
export interface RegistrationsResult {
  tournamentRegistrations: RegistrationEvent;
}
export interface RegistrationsVars {
  tournamentId: string;
}

export const TOURNAMENT_REGISTRATIONS: TypedDocumentNode<RegistrationsResult, RegistrationsVars> = gql`
  subscription TournamentRegistrations($tournamentId: ID!) {
    tournamentRegistrations(tournamentId: $tournamentId) {
      tournamentId
      eventType
      player {
        user {
          id
          firstName
          lastName
          username
          email
        }
        registration {
          id
          registrationTime
          status
          notes
        }
      }
    }
  }
`;

export interface SeatingChangeEvent {
  eventType: string;
  tournamentId: string;
  timestamp: string;
}
export interface TournamentSeatingResult {
  tournamentSeatingChanges: SeatingChangeEvent;
}
export interface TournamentSeatingVars {
  tournamentId: string;
}

/** Per-tournament seating changes (player-accessible). Used to refetch the
 *  viewer's table view live as seats are assigned, moved, or busted. */
export const TOURNAMENT_SEATING_CHANGES: TypedDocumentNode<
  TournamentSeatingResult,
  TournamentSeatingVars
> = gql`
  subscription TournamentSeatingChanges($tournamentId: ID!) {
    tournamentSeatingChanges(tournamentId: $tournamentId) {
      eventType
      tournamentId
      timestamp
    }
  }
`;

export interface UserNotificationsResult {
  userNotifications: UserNotification;
}

export const USER_NOTIFICATIONS: TypedDocumentNode<UserNotificationsResult, Record<string, never>> = gql`
  subscription UserNotifications {
    userNotifications {
      id
      userId
      notificationType
      title
      message
      tournamentId
      createdAt
    }
  }
`;
