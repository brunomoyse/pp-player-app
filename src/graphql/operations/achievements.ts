import { gql, type TypedDocumentNode } from '@apollo/client';

import type { Achievement, PlayerAchievement } from '@/types/achievements';

const ACHIEVEMENT_FIELDS = `
  id
  code
  nameKey
  descriptionKey
  category
  icon
  tier
  thresholdValue
`;

export interface GetMyAchievementsResult {
  myAchievements: PlayerAchievement[];
}

export const GET_MY_ACHIEVEMENTS: TypedDocumentNode<
  GetMyAchievementsResult,
  Record<string, never>
> = gql`
  query GetMyAchievements {
    myAchievements {
      id
      progress
      unlockedAt
      isLocked
      achievement {${ACHIEVEMENT_FIELDS}}
    }
  }
`;

export interface GetAchievementsCatalogResult {
  achievements: Achievement[];
}

export const GET_ACHIEVEMENTS_CATALOG: TypedDocumentNode<
  GetAchievementsCatalogResult,
  Record<string, never>
> = gql`
  query GetAchievementsCatalog {
    achievements {${ACHIEVEMENT_FIELDS}}
  }
`;
