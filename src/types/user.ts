export type Role = 'ADMIN' | 'MANAGER' | 'PLAYER'

export interface User {
    id: string;
    email: string;
    username?: string | null;
    firstName: string;
    lastName?: string | null;
    phone?: string | null;
    isActive: boolean;
    role: Role;
    managedClub?: Club | null;
}

export interface Club {
    id: string;
    name: string;
    city?: string | null;
}

// Notification types
export type NotificationType =
    | 'TOURNAMENT_STARTING_SOON'
    | 'REGISTRATION_CONFIRMED'
    | 'WAITLIST_PROMOTED'
    | 'TOURNAMENT_STATUS_CHANGED'
    | 'ACHIEVEMENT_UNLOCKED'
    | 'SEAT_ASSIGNED'
    | 'PLAYER_MOVED'
    | 'PLAYER_ELIMINATED'
    | 'QUALIFIED_FOR_DAY_2'
    | 'CLUB_ANNOUNCEMENT'

export interface UserNotification {
    id: string;
    userId: string;
    notificationType: NotificationType;
    title: string;
    message: string;
    tournamentId?: string | null;
    createdAt: string;
}

// Auth types
export interface AuthPayload {
    token: string;
    user: User;
}

export interface UserRegistrationInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username?: string;
}

export interface UserLoginInput {
    email: string;
    password: string;
    /** Native clients set this so the backend returns the refresh token in the
     *  response body (stored in the keychain) instead of an HttpOnly cookie. */
    nativeClient?: boolean;
}

export interface OAuthUrlResponse {
    authUrl: string;
    csrfToken: string;
}

export interface OAuthCallbackInput {
    provider: string;
    code: string;
    csrfToken: string;
}
