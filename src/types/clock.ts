import type {TournamentStructure} from "@/types/tournament";

export interface TournamentClock {
    id: string;
    tournamentId: string;
    status: ClockStatus;
    currentLevel: number;
    timeRemainingSeconds?: number | null;
    levelStartedAt?: string | null;
    levelEndTime?: string | null;
    totalPauseDurationSeconds: number;
    autoAdvance: boolean;
    currentStructure?: TournamentStructure | null;
    nextStructure?: TournamentStructure | null;
    // Additional fields for real-time updates
    smallBlind?: number | null;
    bigBlind?: number | null;
    ante?: number | null;
    isBreak?: boolean | null;
    levelDurationMinutes?: number | null;
}

export type ClockStatus = 'STOPPED' | 'RUNNING' | 'PAUSED';