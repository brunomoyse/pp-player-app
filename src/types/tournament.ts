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

    clock?: TournamentClock | null;
    club?: Club;
    registrations: TournamentRegistration[];
    structure: TournamentStructure[];
}

export type TournamentStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED'
export type TournamentLiveStatus = 'NOT_STARTED' | 'REGISTRATION_OPEN' | 'LATE_REGISTRATION' | 'IN_PROGRESS' | 'BREAK' | 'FINAL_TABLE' | 'FINISHED'

export interface TournamentRegistration {
    id: string;
    tournamentId?: string;
    userId: string;
    notes?: string | null;
    registrationTime: string;
    status: RegistrationStatus;
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
    userId: string;
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
    totalAmountCents: number;
    uniquePlayers: number;
    initialCount: number;
    rebuyCount: number;
    reEntryCount: number;
    addonCount: number;
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
    totalBuyIns: number;
    itmPercentage: number;
    roiPercentage: number;
}

export interface PlayerStatsResponse {
    last7Days: PlayerStatistics;
    last30Days: PlayerStatistics;
    lastYear: PlayerStatistics;
}

// Leaderboard types
export type LeaderboardPeriod = 'ALL_TIME' | 'LAST_YEAR' | 'LAST_6_MONTHS' | 'LAST_30_DAYS' | 'LAST_7_DAYS'

export interface LeaderboardEntry {
    user: User;
    rank: number;
    totalTournaments: number;
    totalBuyIns: number;
    totalWinnings: number;
    netProfit: number;
    totalItm: number;
    itmPercentage: number;
    roiPercentage: number;
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
