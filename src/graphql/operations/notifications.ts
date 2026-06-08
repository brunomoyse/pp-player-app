import { gql, type TypedDocumentNode } from '@apollo/client';

import type { PushPlatform } from '@/lib/push';

export interface RegisterDeviceTokenInput {
  token: string;
  platform: PushPlatform;
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
