export interface AttendanceStreak {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  lastCheckInAt: string | null;
}

export interface CheckInResult {
  streak: AttendanceStreak;
  /** The player had already checked in for this tournament. */
  alreadyCheckedIn: boolean;
  /** A freeze was spent to forgive a missed week. */
  freezeUsed: boolean;
  /** The player was away 3+ weeks and is back. */
  isComeback: boolean;
  /** This check-in set a new personal-best streak. */
  isNewLongest: boolean;
}
