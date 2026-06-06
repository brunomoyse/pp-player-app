import { gql, type TypedDocumentNode } from '@apollo/client';

import type { PrivacySettings } from '@/types/scouting';

export interface GetMyPrivacySettingsResult {
  myPrivacySettings: PrivacySettings;
}

/** The current user's consent settings (defaults all OFF). */
export const GET_MY_PRIVACY_SETTINGS: TypedDocumentNode<
  GetMyPrivacySettingsResult,
  Record<string, never>
> = gql`
  query GetMyPrivacySettings {
    myPrivacySettings {
      shareNamedPl
      inScoutingPool
    }
  }
`;

export interface UpdatePrivacySettingsResult {
  updatePrivacySettings: PrivacySettings;
}
export interface UpdatePrivacySettingsVars {
  shareNamedPl: boolean;
  inScoutingPool: boolean;
}

/** Update the current user's granular consent flags. */
export const UPDATE_PRIVACY_SETTINGS: TypedDocumentNode<
  UpdatePrivacySettingsResult,
  UpdatePrivacySettingsVars
> = gql`
  mutation UpdatePrivacySettings($shareNamedPl: Boolean!, $inScoutingPool: Boolean!) {
    updatePrivacySettings(shareNamedPl: $shareNamedPl, inScoutingPool: $inScoutingPool) {
      shareNamedPl
      inScoutingPool
    }
  }
`;
