// Achievement domain types — mirror the pp-service GraphQL `achievements` API.

export type AchievementCategory =
  | 'REGISTRATION'
  | 'WINNINGS'
  | 'RESULTS'
  | 'MILESTONES'
  | 'STREAKS'

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

export interface Achievement {
  id: string
  code: string
  /** i18n key, e.g. "achievements.items.first_win.name" */
  nameKey: string
  /** i18n key, e.g. "achievements.items.first_win.description" */
  descriptionKey: string
  category: AchievementCategory
  /** ionicon name, e.g. "trophy-outline" */
  icon?: string | null
  tier?: AchievementTier | null
  thresholdValue?: number | null
}

export interface PlayerAchievement {
  id: string
  progress: number
  unlockedAt?: string | null
  isLocked: boolean
  achievement: Achievement
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'REGISTRATION',
  'WINNINGS',
  'RESULTS',
  'MILESTONES',
  'STREAKS',
]
