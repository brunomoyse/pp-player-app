import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Badge, Button, Card, EmptyState, LoadingState, Screen, Text } from '@/components/ui';
import { BackButton } from '@/components';
import {
  CLAIM_QUEST,
  GET_CLUB_HALL_OF_FAME,
  GET_CURRENT_SEASON,
  GET_MY_SEASON_PASS,
  GET_WEEKLY_QUESTS,
} from '@/graphql/operations';
import { success } from '@/lib/haptics';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { useClubStore } from '@/stores/useClubStore';
import { colors } from '@/theme/tokens';
import type { QuestProgress } from '@/types/season';

function ProgressBar({ ratio, tone = 'gold' }: { ratio: number; tone?: 'gold' | 'muted' }) {
  const pct = `${Math.max(0, Math.min(1, ratio)) * 100}%` as const;
  return (
    <View className="h-2 overflow-hidden rounded-full bg-white/10">
      <View
        className={tone === 'gold' ? 'h-full rounded-full bg-pp-gold' : 'h-full rounded-full bg-white/30'}
        style={{ width: pct }}
      />
    </View>
  );
}

function QuestRow({
  quest,
  onClaim,
  claiming,
}: {
  quest: QuestProgress;
  onClaim: (code: string) => void;
  claiming: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View className="gap-2 py-2">
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1">
          <Text className="font-sans-semibold text-pp-text">{t(`quests.${quest.code}.title`)}</Text>
          <Text variant="dim">
            {t(`quests.${quest.code}.description`)}
          </Text>
        </View>
        {quest.claimed ? (
          <Badge tone="gold" label={t('season.claimed')} />
        ) : quest.completed ? (
          <Button
            title={t('season.claimXp', { xp: quest.xpReward })}
            variant="primary"
            loading={claiming}
            accessibilityHint={t('season.a11y.claimHint')}
            onPress={() => onClaim(quest.code)}
          />
        ) : (
          <Text variant="dim">
            {quest.progress}/{quest.target}
          </Text>
        )}
      </View>
      <ProgressBar ratio={quest.target ? quest.progress / quest.target : 0} tone={quest.claimed ? 'muted' : 'gold'} />
    </View>
  );
}

export default function SeasonScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const selectedClub = useClubStore((s) => s.selectedClub);
  const clubId = selectedClub?.id ?? null;

  const seasonQ = useQuery(GET_CURRENT_SEASON, {
    variables: { clubId: clubId ?? '' },
    skip: !isAuth || !clubId,
  });
  const season = seasonQ.data?.currentSeason ?? null;

  const passQ = useQuery(GET_MY_SEASON_PASS, {
    variables: { seasonId: season?.id ?? '' },
    skip: !season,
  });
  const pass = passQ.data?.mySeasonPass;

  const questsQ = useQuery(GET_WEEKLY_QUESTS, { skip: !isAuth });
  const quests = questsQ.data?.weeklyQuests ?? [];

  const hofQ = useQuery(GET_CLUB_HALL_OF_FAME, {
    variables: { clubId: clubId ?? '' },
    skip: !isAuth || !clubId,
  });
  const hallOfFame = hofQ.data?.clubHallOfFame ?? [];

  const [claimQuest, { loading: claiming }] = useMutation(CLAIM_QUEST, {
    refetchQueries: [
      { query: GET_WEEKLY_QUESTS },
      ...(season ? [{ query: GET_MY_SEASON_PASS, variables: { seasonId: season.id } }] : []),
    ],
  });

  const onClaim = async (code: string) => {
    try {
      await claimQuest({ variables: { code } });
      success();
    } catch {
      // Surface nothing loud; the row simply stays unclaimed on failure.
    }
  };

  if (!isAuth) return <Redirect href="/login" />;

  const loading = seasonQ.loading && !seasonQ.data;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={seasonQ.networkStatus === 4}
        onRefresh={() => void seasonQ.refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('season.title')}</Text>
        </View>

        {!clubId ? (
          <EmptyState icon="business-outline" message={t('season.selectClub')} />
        ) : loading ? (
          <LoadingState label={t('common.loading')} />
        ) : !season ? (
          <EmptyState icon="trophy-outline" message={t('season.noActiveSeason')} />
        ) : (
          <>
            {/* Season pass */}
            <Card highlighted className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="label" className="text-pp-gold-deep">
                  {season.name}
                </Text>
                {pass?.isPremium ? <Badge tone="gold" label={t('season.premium')} /> : null}
              </View>

              <View className="flex-row items-end justify-between">
                <Text variant="title">{t('season.tier', { tier: pass?.tier ?? 0 })}</Text>
                <Text variant="dim">
                  {t('season.xp', { xp: pass?.xp ?? 0 })}
                </Text>
              </View>

              <ProgressBar ratio={pass && pass.xpPerTier ? pass.xpIntoTier / pass.xpPerTier : 0} />
              <Text variant="micro">
                {t('season.xpToNext', {
                  xp: pass ? Math.max(0, pass.xpPerTier - pass.xpIntoTier) : 0,
                })}
              </Text>
            </Card>

            {/* Weekly quests */}
            <Card className="gap-1">
              <Text variant="label" className="mb-1 text-pp-gold-deep">
                {t('season.weeklyQuests')}
              </Text>
              {quests.length === 0 ? (
                <Text variant="dim">
                  {t('common.loading')}
                </Text>
              ) : (
                quests.map((q) => (
                  <QuestRow key={q.code} quest={q} onClaim={onClaim} claiming={claiming} />
                ))
              )}
            </Card>
          </>
        )}

        {/* Hall of Fame */}
        {clubId ? (
          <Card className="gap-2">
            <Text variant="label" className="mb-1 text-pp-gold-deep">
              {t('season.hallOfFame')}
            </Text>
            {hallOfFame.length === 0 ? (
              <Text variant="dim">
                {t('season.noChampions')}
              </Text>
            ) : (
              hallOfFame.map((e) => (
                <View key={e.seasonId} className="flex-row items-center gap-3 py-1.5">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <Ionicons name="trophy" size={18} color={colors.gold} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-pp-text">{e.championName}</Text>
                    <Text variant="dim">
                      {e.seasonName} · {t('season.events', { count: e.events })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        ) : null}
      </Screen>
    </>
  );
}
