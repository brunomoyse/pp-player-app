import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  PrivacySettings,
  ScoutingMatch,
  ScoutingProfile,
  ScoutingQuota,
} from '@/types/scouting';

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

export interface ScoutingSearchResult {
  scoutingSearch: ScoutingMatch[];
}
export interface ScoutingSearchVars {
  query: string;
}

/** Search the scouting pool by handle (free, no quota). */
export const SCOUTING_SEARCH: TypedDocumentNode<ScoutingSearchResult, ScoutingSearchVars> = gql`
  query ScoutingSearch($query: String!) {
    scoutingSearch(query: $query) {
      userId
      handle
    }
  }
`;

export interface ScoutingProfileResult {
  scoutingProfile: ScoutingProfile;
}
export interface ScoutingProfileVars {
  userId: string;
}

/** View a pool member's profile (consumes one free lookup). */
export const SCOUTING_PROFILE: TypedDocumentNode<ScoutingProfileResult, ScoutingProfileVars> = gql`
  query ScoutingProfile($userId: ID!) {
    scoutingProfile(userId: $userId) {
      userId
      handle
      tournaments
      itmPercentage
      bestFinish
    }
  }
`;

export interface GetMyScoutingQuotaResult {
  myScoutingQuota: ScoutingQuota;
}

/** The current user's free-lookup quota standing. */
export const GET_MY_SCOUTING_QUOTA: TypedDocumentNode<
  GetMyScoutingQuotaResult,
  Record<string, never>
> = gql`
  query GetMyScoutingQuota {
    myScoutingQuota {
      used
      limit
      unlimited
    }
  }
`;
