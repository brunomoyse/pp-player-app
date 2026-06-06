import { gql, type TypedDocumentNode } from '@apollo/client';

import type { HallOfFameEntry, QuestProgress, Season, SeasonPass } from '@/types/season';

export interface GetCurrentSeasonResult {
  currentSeason: Season | null;
}
export interface GetCurrentSeasonVars {
  clubId: string;
}

/** The club's currently-running season, if any. */
export const GET_CURRENT_SEASON: TypedDocumentNode<
  GetCurrentSeasonResult,
  GetCurrentSeasonVars
> = gql`
  query GetCurrentSeason($clubId: ID!) {
    currentSeason(clubId: $clubId) {
      id
      clubId
      name
      startsAt
      endsAt
      isActive
    }
  }
`;

export interface GetMySeasonPassResult {
  mySeasonPass: SeasonPass;
}
export interface GetMySeasonPassVars {
  seasonId: string;
}

/** The current user's pass standing (XP/tier/premium) for a season. */
export const GET_MY_SEASON_PASS: TypedDocumentNode<
  GetMySeasonPassResult,
  GetMySeasonPassVars
> = gql`
  query GetMySeasonPass($seasonId: ID!) {
    mySeasonPass(seasonId: $seasonId) {
      seasonId
      xp
      tier
      xpIntoTier
      xpPerTier
      isPremium
    }
  }
`;

export interface GetWeeklyQuestsResult {
  weeklyQuests: QuestProgress[];
}

/** This week's three rotating quests with the current user's progress. */
export const GET_WEEKLY_QUESTS: TypedDocumentNode<
  GetWeeklyQuestsResult,
  Record<string, never>
> = gql`
  query GetWeeklyQuests {
    weeklyQuests {
      code
      target
      progress
      completed
      claimed
      xpReward
    }
  }
`;

export interface GetClubHallOfFameResult {
  clubHallOfFame: HallOfFameEntry[];
}
export interface GetClubHallOfFameVars {
  clubId: string;
}

/** A club's Hall of Fame — the champion of every finished season. */
export const GET_CLUB_HALL_OF_FAME: TypedDocumentNode<
  GetClubHallOfFameResult,
  GetClubHallOfFameVars
> = gql`
  query GetClubHallOfFame($clubId: ID!) {
    clubHallOfFame(clubId: $clubId) {
      seasonId
      seasonName
      endsAt
      championName
      events
    }
  }
`;

export interface ClaimQuestResult {
  claimQuest: QuestProgress;
}
export interface ClaimQuestVars {
  code: string;
}

/** Claim a completed weekly quest, banking its XP into the active season pass. */
export const CLAIM_QUEST: TypedDocumentNode<ClaimQuestResult, ClaimQuestVars> = gql`
  mutation ClaimQuest($code: String!) {
    claimQuest(code: $code) {
      code
      target
      progress
      completed
      claimed
      xpReward
    }
  }
`;
