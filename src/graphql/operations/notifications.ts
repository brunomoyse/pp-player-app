import { gql, type TypedDocumentNode } from '@apollo/client';

import type { PushPlatform } from '@/lib/push';

export interface RegisterDeviceTokenInput {
  token: string;
  platform: PushPlatform;
  /** Device locale (e.g. `en`, `fr`, `nl`) used to localize push copy. */
  locale?: string;
}

export interface RegisterDeviceTokenResult {
  registerDeviceToken: boolean;
}
export interface RegisterDeviceTokenVars {
  input: RegisterDeviceTokenInput;
}

// Persist (or refresh) this device's Expo push token for the authenticated
// user. Idempotent server-side on (user, token).
export const REGISTER_DEVICE_TOKEN: TypedDocumentNode<
  RegisterDeviceTokenResult,
  RegisterDeviceTokenVars
> = gql`
  mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {
    registerDeviceToken(input: $input)
  }
`;

export interface UnregisterDeviceTokenResult {
  unregisterDeviceToken: boolean;
}
export interface UnregisterDeviceTokenVars {
  token: string;
}

// Drop this device's token on logout so a signed-out device stops receiving
// the previous user's push notifications.
export const UNREGISTER_DEVICE_TOKEN: TypedDocumentNode<
  UnregisterDeviceTokenResult,
  UnregisterDeviceTokenVars
> = gql`
  mutation UnregisterDeviceToken($token: String!) {
    unregisterDeviceToken(token: $token)
  }
`;

export interface NotificationPreferences {
  tournamentReminders: boolean;
  registrationUpdates: boolean;
  seatingUpdates: boolean;
  achievements: boolean;
}

const PREF_FIELDS = gql`
  fragment NotificationPreferenceFields on NotificationPreferences {
    tournamentReminders
    registrationUpdates
    seatingUpdates
    achievements
  }
`;

export interface GetMyNotificationPreferencesResult {
  myNotificationPreferences: NotificationPreferences;
}

// Per-category notification preferences (server defaults to all-on until the
// user changes something).
export const GET_MY_NOTIFICATION_PREFERENCES: TypedDocumentNode<
  GetMyNotificationPreferencesResult,
  Record<string, never>
> = gql`
  query GetMyNotificationPreferences {
    myNotificationPreferences {
      ...NotificationPreferenceFields
    }
  }
  ${PREF_FIELDS}
`;

export interface UpdateNotificationPreferencesInput {
  tournamentReminders?: boolean;
  registrationUpdates?: boolean;
  seatingUpdates?: boolean;
  achievements?: boolean;
}
export interface UpdateNotificationPreferencesResult {
  updateNotificationPreferences: NotificationPreferences;
}
export interface UpdateNotificationPreferencesVars {
  input: UpdateNotificationPreferencesInput;
}

// Partial update — omitted fields keep their current value.
export const UPDATE_NOTIFICATION_PREFERENCES: TypedDocumentNode<
  UpdateNotificationPreferencesResult,
  UpdateNotificationPreferencesVars
> = gql`
  mutation UpdateNotificationPreferences($input: UpdateNotificationPreferencesInput!) {
    updateNotificationPreferences(input: $input) {
      ...NotificationPreferenceFields
    }
  }
  ${PREF_FIELDS}
`;

export interface DeleteMyAccountResult {
  deleteMyAccount: boolean;
}

// Self-service account deletion: the server anonymizes personal data,
// deactivates the account and revokes all sessions/device tokens.
export const DELETE_MY_ACCOUNT: TypedDocumentNode<DeleteMyAccountResult, Record<string, never>> =
  gql`
    mutation DeleteMyAccount {
      deleteMyAccount
    }
  `;
