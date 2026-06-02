import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  RegistrationStatus,
  TournamentLiveStatus,
  TournamentStatus,
} from '@/types/tournament';
import type { Club } from '@/types/user';

/** Tournament summary embedded in a registration row. */
export interface RegistrationTournament {
  id: string;
  title: string;
  startTime: string;
  endTime?: string | null;
  buyInCents: number;
  rakeCents: number;
  liveStatus: TournamentLiveStatus;
  status: TournamentStatus;
  club?: Club | null;
}

export interface MyRegistration {
  id: string;
  tournamentId: string;
  status: RegistrationStatus;
  registrationTime: string;
  notes?: string | null;
  waitlistPosition?: number | null;
  tournament: RegistrationTournament;
}

export interface GetMyRegistrationsResult {
  myTournamentRegistrations: MyRegistration[];
}

export const GET_MY_REGISTRATIONS: TypedDocumentNode<
  GetMyRegistrationsResult,
  Record<string, never>
> = gql`
  query GetMyRegistrations {
    myTournamentRegistrations {
      id
      tournamentId
      status
      registrationTime
      notes
      waitlistPosition
      tournament {
        id
        title
        startTime
        endTime
        buyInCents
        rakeCents
        liveStatus
        status
        club {
          id
          name
          city
        }
      }
    }
  }
`;

export interface SelfCheckInInput {
  tournamentId: string;
}
export interface SelfCheckInResult {
  selfCheckIn: {
    registration: { id: string; tournamentId: string; userId: string; registrationTime: string; status: RegistrationStatus };
    seatAssignment?: { id: string; clubTableId: string; userId: string; seatNumber: number; stackSize?: number | null } | null;
    message: string;
    wasRegistered: boolean;
  };
}
export interface SelfCheckInVars {
  input: SelfCheckInInput;
}

export const SELF_CHECK_IN: TypedDocumentNode<SelfCheckInResult, SelfCheckInVars> = gql`
  mutation SelfCheckIn($input: SelfCheckInInput!) {
    selfCheckIn(input: $input) {
      registration {
        id
        tournamentId
        userId
        registrationTime
        status
      }
      seatAssignment {
        id
        clubTableId
        userId
        seatNumber
        stackSize
      }
      message
      wasRegistered
    }
  }
`;

export interface CancelRegistrationInput {
  tournamentId: string;
  userId?: string;
}
export interface CancelRegistrationResult {
  cancelRegistration: {
    registration: { id: string; status: RegistrationStatus };
    promotedPlayer?: {
      registration: { id: string; status: RegistrationStatus };
      user: { id: string; firstName?: string | null; lastName?: string | null };
    } | null;
  };
}
export interface CancelRegistrationVars {
  input: CancelRegistrationInput;
}

export const CANCEL_REGISTRATION: TypedDocumentNode<
  CancelRegistrationResult,
  CancelRegistrationVars
> = gql`
  mutation CancelRegistration($input: CancelRegistrationInput!) {
    cancelRegistration(input: $input) {
      registration {
        id
        status
      }
      promotedPlayer {
        registration {
          id
          status
        }
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
