import type { User } from './user'

export interface ClubTable {
    id: string;
    clubId: string;
    tableNumber: number;
    maxSeats: number;
    isActive: boolean;
    isAssigned: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TournamentTable {
    id: string;
    tournamentId: string;
    tableNumber: number;
    maxSeats: number;
    isActive: boolean;
    createdAt: string;
}

export interface SeatAssignment {
    id: string;
    tournamentId: string;
    clubTableId: string;
    userId: string;
    seatNumber: number;
    stackSize?: number | null;
    isCurrent: boolean;
    assignedAt: string;
    unassignedAt?: string | null;
    assignedBy?: string | null;
    notes?: string | null;
}

export interface SeatWithPlayer {
    assignment: SeatAssignment;
    player: User;
}

export interface TableWithSeats {
    table: TournamentTable;
    seats: SeatWithPlayer[];
}

export interface TournamentSeatingChart {
    tournament: {
        id: string;
        title: string;
    };
    tables: TableWithSeats[];
    unassignedPlayers: User[];
}

export interface CheckInResponse {
    registration: {
        id: string;
        status: string;
    };
    seatAssignment?: SeatAssignment | null;
    message: string;
}

export enum AssignmentStrategy {
    /** Balanced distribution - fills tables evenly */
    BALANCED = 'BALANCED',
    /** Random assignment for fairness */
    RANDOM = 'RANDOM',
    /** Sequential - fills tables in order */
    SEQUENTIAL = 'SEQUENTIAL',
    /** Manual - no auto-assignment */
    MANUAL = 'MANUAL'
}

export type SeatingEventType =
    | 'PLAYER_ASSIGNED'
    | 'PLAYER_MOVED'
    | 'PLAYER_ELIMINATED'
    | 'STACK_UPDATED'
    | 'TABLE_CREATED'
    | 'TABLE_CLOSED'
    | 'TOURNAMENT_STATUS_CHANGED'
    | 'TABLES_BALANCED'

export interface SeatingChangeEvent {
    eventType: SeatingEventType;
    tournamentId: string;
    clubId: string;
    affectedAssignment?: SeatAssignment | null;
    affectedPlayer?: User | null;
    message: string;
    timestamp: string;
}

// Input types for mutations
export interface CheckInPlayerInput {
    tournamentId: string;
    userId: string;
    assignmentStrategy?: AssignmentStrategy;
    autoAssign?: boolean;
}

export interface AssignPlayerToSeatInput {
    tournamentId: string;
    clubTableId: string;
    userId: string;
    seatNumber: number;
    stackSize?: number;
    notes?: string;
}

export interface MovePlayerInput {
    tournamentId: string;
    userId: string;
    newClubTableId: string;
    newSeatNumber: number;
    notes?: string;
}

export interface UpdateStackSizeInput {
    tournamentId: string;
    userId: string;
    newStackSize: number;
}

export interface BalanceTablesInput {
    tournamentId: string;
    targetPlayersPerTable?: number;
}

export interface AssignTableToTournamentInput {
    tournamentId: string;
    clubTableId: string;
}
