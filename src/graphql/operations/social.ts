import { gql, type TypedDocumentNode } from '@apollo/client';

import type { Friend, YearInPoker } from '@/types/social';
import type { TournamentRegistration } from '@/types/tournament';

export interface PlayerSearchHit {
  id: string;
  username?: string | null;
  firstName: string;
  lastName?: string | null;
}
export interface SearchPlayersResult {
  users: { items: PlayerSearchHit[] };
}
export interface SearchPlayersVars {
  search: string;
}

/** Search app users by name to send a friend request. */
export const SEARCH_PLAYERS: TypedDocumentNode<
  SearchPlayersResult,
  SearchPlayersVars
> = gql`
  query SearchPlayers($search: String!) {
    users(search: $search, isActive: true, pagination: { limit: 15, offset: 0 }) {
      items {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

const FRIEND_FIELDS = gql`
  fragment FriendFields on Friend {
    friendshipId
    userId
    name
    status
    isIncoming
    iCanRegisterThem
    canRegisterMe
    flame {
      sharedNights
      lastShared
      alive
    }
  }
`;

export interface GetMyFriendsResult {
  myFriends: Friend[];
}

/** The current user's accepted friends, each with their mutual flame. */
export const GET_MY_FRIENDS: TypedDocumentNode<GetMyFriendsResult, Record<string, never>> = gql`
  query GetMyFriends {
    myFriends {
      ...FriendFields
    }
  }
  ${FRIEND_FIELDS}
`;

export interface GetIncomingFriendRequestsResult {
  incomingFriendRequests: Friend[];
}

/** Pending friend requests the current user has received. */
export const GET_INCOMING_FRIEND_REQUESTS: TypedDocumentNode<
  GetIncomingFriendRequestsResult,
  Record<string, never>
> = gql`
  query GetIncomingFriendRequests {
    incomingFriendRequests {
      ...FriendFields
    }
  }
  ${FRIEND_FIELDS}
`;

export interface GetOutgoingFriendRequestsResult {
  outgoingFriendRequests: Friend[];
}

/** Pending friend requests the current user has sent (awaiting the other party). */
export const GET_OUTGOING_FRIEND_REQUESTS: TypedDocumentNode<
  GetOutgoingFriendRequestsResult,
  Record<string, never>
> = gql`
  query GetOutgoingFriendRequests {
    outgoingFriendRequests {
      ...FriendFields
    }
  }
  ${FRIEND_FIELDS}
`;

export interface SendFriendRequestResult {
  sendFriendRequest: Friend;
}
export interface SendFriendRequestVars {
  userId: string;
}

/** Send a friend request to another player. */
export const SEND_FRIEND_REQUEST: TypedDocumentNode<
  SendFriendRequestResult,
  SendFriendRequestVars
> = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId) {
      friendshipId
      userId
      name
      status
      isIncoming
    }
  }
`;

export interface AcceptFriendRequestResult {
  acceptFriendRequest: Friend;
}
export interface AcceptFriendRequestVars {
  friendshipId: string;
}

/** Accept a pending friend request. */
export const ACCEPT_FRIEND_REQUEST: TypedDocumentNode<
  AcceptFriendRequestResult,
  AcceptFriendRequestVars
> = gql`
  mutation AcceptFriendRequest($friendshipId: ID!) {
    acceptFriendRequest(friendshipId: $friendshipId) {
      friendshipId
      userId
      name
      status
      isIncoming
    }
  }
`;

export interface RemoveFriendResult {
  removeFriend: boolean;
}
export interface RemoveFriendVars {
  friendshipId: string;
}

/** Remove a friend or decline a request. */
export const REMOVE_FRIEND: TypedDocumentNode<RemoveFriendResult, RemoveFriendVars> = gql`
  mutation RemoveFriend($friendshipId: ID!) {
    removeFriend(friendshipId: $friendshipId)
  }
`;

export interface GetMyYearInPokerResult {
  myYearInPoker: YearInPoker;
}
export interface GetMyYearInPokerVars {
  year?: number;
}

/** "Your Year in Poker" — a shareable annual recap. */
export const GET_MY_YEAR_IN_POKER: TypedDocumentNode<
  GetMyYearInPokerResult,
  GetMyYearInPokerVars
> = gql`
  query GetMyYearInPoker($year: Int) {
    myYearInPoker(year: $year) {
      year
      tournaments
      buyinsCents
      winningsCents
      netCents
      itmCount
      bestFinish
      checkIns
      longestStreak
      favoriteClub
      nemesisName
    }
  }
`;

export interface SetFriendRegistrationPermissionResult {
  setFriendRegistrationPermission: boolean;
}
export interface SetFriendRegistrationPermissionVars {
  friendshipId: string;
  allow: boolean;
}

/** Allow or deny a friend to register you for tournaments. */
export const SET_FRIEND_REGISTRATION_PERMISSION: TypedDocumentNode<
  SetFriendRegistrationPermissionResult,
  SetFriendRegistrationPermissionVars
> = gql`
  mutation SetFriendRegistrationPermission($friendshipId: ID!, $allow: Boolean!) {
    setFriendRegistrationPermission(friendshipId: $friendshipId, allow: $allow)
  }
`;

export interface RegisterFriendForTournamentResult {
  registerFriendForTournament: TournamentRegistration;
}
export interface RegisterFriendForTournamentVars {
  friendUserId: string;
  tournamentId: string;
}

/** Register a friend for a tournament on their behalf (if they granted you permission). */
export const REGISTER_FRIEND_FOR_TOURNAMENT: TypedDocumentNode<
  RegisterFriendForTournamentResult,
  RegisterFriendForTournamentVars
> = gql`
  mutation RegisterFriendForTournament($friendUserId: ID!, $tournamentId: ID!) {
    registerFriendForTournament(friendUserId: $friendUserId, tournamentId: $tournamentId) {
      id
      tournamentId
      userId
      clubPlayerId
      displayName
      registrationTime
      status
      notes
    }
  }
`;
