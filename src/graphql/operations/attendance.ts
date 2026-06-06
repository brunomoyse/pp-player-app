import { gql, type TypedDocumentNode } from '@apollo/client';

import type { AttendanceStreak, CheckInResult } from '@/types/attendance';

export interface GetMyAttendanceStreakResult {
  myAttendanceStreak: AttendanceStreak | null;
}

/** The current user's attendance streak, or null if they've never checked in. */
export const GET_MY_ATTENDANCE_STREAK: TypedDocumentNode<
  GetMyAttendanceStreakResult,
  Record<string, never>
> = gql`
  query GetMyAttendanceStreak {
    myAttendanceStreak {
      currentStreak
      longestStreak
      freezesAvailable
      lastCheckInAt
    }
  }
`;

export interface RecordCheckInResult {
  recordCheckIn: CheckInResult;
}

export interface RecordCheckInVars {
  tournamentId: string;
}

/** Record the current user's check-in and advance their attendance streak. */
export const RECORD_CHECK_IN: TypedDocumentNode<RecordCheckInResult, RecordCheckInVars> = gql`
  mutation RecordCheckIn($tournamentId: ID!) {
    recordCheckIn(tournamentId: $tournamentId) {
      streak {
        currentStreak
        longestStreak
        freezesAvailable
        lastCheckInAt
      }
      alreadyCheckedIn
      freezeUsed
      isComeback
      isNewLongest
    }
  }
`;
