import type { Club, User } from './user'
import type {TournamentClock} from "@/types/clock";

export interface Tournament {
    id: string;
    buyInCents: number;
    rakeCents: number;
    clubId?: string;
    createdAt?: string;
    description?: string | null;
    endTime?: string | null;
    liveStatus: TournamentLiveStatus;
    seatCap?: number | null;
    startTime: string;
    status: TournamentStatus;
    title: string;
    updatedAt?: string;
    voucherValueCents?: number;
    levelTwoBonusChips?: number | null;
    rebuyMax?: number | null;
    addonChips?: number | null;
    addonPriceCents?: number | null;

    /** Multi-day series this tournament belongs to (null for single-day events). */
    seriesId?: string | null;
    /** Flight label within the series, e.g. "Day 1A" or "Day 2". */
    flightLabel?: string | null;
    /** True when this is the series' final day (Day 2). */
    isFinalDay?: boolean;

    /** Bounty / progressive-knockout format (NONE for a standard tournament). */
    bountyType?: BountyType;
    /** Bounty slice taken from each buy-in / rebuy / re-entry, in cents. */
    bountyAmountCents?: number;

    clock?: TournamentClock | null;
    club?: Club;
    /** Players taking part (excludes cancellations and no-shows). */
    registrationCount?: number;
    registrations: TournamentRegistration[];
    structure: TournamentStructure[];
}

export type TournamentStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED'
export type TournamentLiveStatus = 'NOT_STARTED' | 'REGISTRATION_OPEN' | 'LATE_REGISTRATION' | 'IN_PROGRESS' | 'BREAK' | 'FINAL_TABLE' | 'FINISHED'

/** none | fixed | progressive (PKO). */
export type BountyType = 'NONE' | 'FIXED' | 'PROGRESSIVE'

export interface TournamentRegistration {
    id: string;
    tournamentId?: string;
    userId?: string | null;
    clubPlayerId: string;
    displayName: string;
    notes?: string | null;
    registrationTime: string;
    status: RegistrationStatus;
    /** 1-based position when status is WAITLISTED, null otherwise. */
    waitlistPosition?: number | null;
    /** Carried-over chip stack for a multi-day final-day seat (null otherwise). */
    startingStack?: number | null;
    /** Live progressive-knockout bounty head for this player, in cents (0 for non-PKO). */
    currentBountyCents?: number;
    user?: {
        id: string;
        firstName?: string | null;
        username?: string | null;
    } | null;
}

export type RegistrationStatus = 'REGISTERED' | 'CHECKED_IN' | 'SEATED' | 'BUSTED' | 'WAITLISTED' | 'CANCELLED' | 'NO_SHOW'

export interface TournamentResult {
    id: string;
    tournamentId: string;
    userId?: string | null;
    clubPlayerId: string;
    displayName: string;
    finalPosition: number;
    prizeCents: number;
    points: number;
    notes?: string | null;
    createdAt: string;
}

export interface UserTournamentResult {
    result: TournamentResult;
    tournament: Tournament;
}

export interface TournamentStructure {
    id: string;
    tournamentId: string;
    levelNumber: number;
    smallBlind: number;
    bigBlind: number;
    ante: number;
    durationMinutes: number;
    isBreak: boolean;
    breakDurationMinutes?: number | null;
}

// Tournament Entry types (buy-ins, rebuys, add-ons)
export type EntryType = 'INITIAL' | 'REBUY' | 'RE_ENTRY' | 'ADDON'

export interface TournamentEntry {
    id: string;
    tournamentId: string;
    userId: string;
    entryType: EntryType;
    amountCents: number;
    chipsReceived?: number | null;
    recordedBy?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TournamentEntryStats {
    tournamentId: string;
    totalEntries: number;
    uniquePlayers: number;
    initialCount: number;
    rebuyCount: number;
    reEntryCount: number;
    addonCount: number;
    /** Total chips in play across all entries (i64 — may arrive as a string, coerce with Number). */
    totalChips?: number;
    /** Active players still in the tournament. */
    playersRemaining?: number;
}

/** A single recorded knockout in a bounty / PKO tournament. */
export interface TournamentBounty {
    id: string;
    tournamentId: string;
    hunterClubPlayerId: string;
    victimClubPlayerId: string;
    hunterName: string;
    victimName: string;
    /** Cash the hunter collected for this knockout, in cents. */
    amountCents: number;
    createdAt: string;
}

// Player Deal types (ICM, even split, custom)
export type DealType = 'EVEN_SPLIT' | 'ICM' | 'CUSTOM'

export interface CustomPayout {
    userId: string;
    amountCents: number;
}

export interface PlayerDeal {
    id: string;
    tournamentId: string;
    dealType: DealType;
    affectedPositions: number[];
    customPayouts?: CustomPayout[] | null;
    totalAmountCents: number;
    notes?: string | null;
    createdBy: string;
}

// Tournament Payout types
export interface PayoutPosition {
    position: number;
    percentage: number;
    amountCents: number;
}

export interface TournamentPayout {
    id: string;
    tournamentId: string;
    templateId?: string | null;
    playerCount: number;
    totalPrizePool: number;
    positions: PayoutPosition[];
    createdAt: string;
    updatedAt: string;
}

// Player Statistics types
export interface PlayerStatistics {
    totalItm: number;
    totalTournaments: number;
    totalWinnings: number;
    itmPercentage: number;
}

export interface PlayerStatsResponse {
    last30Days: PlayerStatistics;
    lastYear: PlayerStatistics;
    allTime: PlayerStatistics;
}

// Leaderboard types
export type LeaderboardPeriod = 'ALL_TIME' | 'LAST_YEAR' | 'LAST_6_MONTHS' | 'LAST_30_DAYS' | 'LAST_7_DAYS'

export interface LeaderboardEntry {
    user?: User | null;
    clubPlayerId: string;
    displayName: string;
    rank: number;
    totalTournaments: number;
    totalBuyIns: number;
    totalWinnings: number;
    totalItm: number;
    itmPercentage: number;
    averageFinish: number;
    firstPlaces: number;
    finalTables: number;
    points: number;
}

export interface LeaderboardResponse {
    entries: LeaderboardEntry[];
    totalPlayers: number;
    period: LeaderboardPeriod;
}

// Tournament Player (registration + user)
export interface TournamentPlayer {
    registration: TournamentRegistration;
    user: User;
}

// Input types for mutations
export interface AddTournamentEntryInput {
    tournamentId: string;
    userId: string;
    entryType: EntryType;
    amountCents?: number;
    chipsReceived?: number;
    notes?: string;
}

export interface PlayerPositionInput {
    userId: string;
    finalPosition: number;
}

export interface CustomPayoutInput {
    userId: string;
    amountCents: number;
}

export interface PlayerDealInput {
    dealType: DealType;
    affectedPositions: number[];
    customPayouts?: CustomPayoutInput[];
    notes?: string;
}

export interface EnterTournamentResultsInput {
    tournamentId: string;
    payoutTemplateId?: string;
    playerPositions: PlayerPositionInput[];
    deal?: PlayerDealInput;
}

export interface EnterTournamentResultsResponse {
    success: boolean;
    results: TournamentResult[];
    deal?: PlayerDeal | null;
}

export interface UpdateTournamentStatusInput {
    tournamentId: string;
    liveStatus: TournamentLiveStatus;
}

export interface RegisterForTournamentInput {
    tournamentId: string;
    userId?: string;
    notes?: string;
}
