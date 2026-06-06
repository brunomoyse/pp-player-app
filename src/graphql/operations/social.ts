import { gql, type TypedDocumentNode } from '@apollo/client';

import type { Friend, Rivalry, YearInPoker } from '@/types/social';

export interface GetMyRivalriesResult {
  myRivalries: Rivalry[];
}
export interface GetMyRivalriesVars {
  limit?: number;
}

/** Head-to-head records, most-played opponents first. */
export const GET_MY_RIVALRIES: TypedDocumentNode<
  GetMyRivalriesResult,
  GetMyRivalriesVars
> = gql`
  query GetMyRivalries($limit: Int) {
    myRivalries(limit: $limit) {
      opponentId
      opponentName
      meetings
      wins
      losses
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
