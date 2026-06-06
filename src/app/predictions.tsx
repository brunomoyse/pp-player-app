import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Badge, Button, Card, EmptyState, LoadingState, Screen, Text } from '@/components/ui';
import {
  CLAIM_PREDICTION_POINTS,
  GET_MY_PREDICTION_BALANCE,
  GET_MY_PREDICTIONS,
} from '@/graphql/operations';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { PredictionStatus } from '@/types/prediction';

const STATUS_TONE: Record<PredictionStatus, 'gold' | 'neutral' | 'live'> = {
  won: 'gold',
  lost: 'neutral',
  open: 'live',
};

export default function PredictionsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const flags = useFeatureFlags();

  const balanceQ = useQuery(GET_MY_PREDICTION_BALANCE, {
    skip: !isAuth || !flags.predictions,
    notifyOnNetworkStatusChange: true,
  });
  const predictionsQ = useQuery(GET_MY_PREDICTIONS, { skip: !isAuth || !flags.predictions });

  const [claim, { loading: claiming }] = useMutation(CLAIM_PREDICTION_POINTS, {
    refetchQueries: [{ query: GET_MY_PREDICTION_BALANCE }],
  });

  const bal = balanceQ.data?.myPredictionBalance;
  const predictions = predictionsQ.data?.myPredictions ?? [];

  if (!isAuth) return <Redirect href="/login" />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={balanceQ.networkStatus === 4}
        onRefresh={() => void balanceQ.refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
          </Pressable>
          <Text variant="title">{t('predictions.title')}</Text>
        </View>

        {!flags.predictions ? (
          <EmptyState message={t('common.notYetAvailable')} />
        ) : balanceQ.loading && !balanceQ.data ? (
          <LoadingState label={t('common.loading')} />
        ) : (
          <>
            {/* Balance + claim */}
            <Card highlighted className="items-center gap-1 py-6">
              <Text variant="label" className="text-pp-gold-deep">
                {t('predictions.balanceLabel')}
              </Text>
              <Text className="font-sans-bold text-4xl text-pp-gold">{bal?.balance ?? 0}</Text>
              <Text variant="muted">{t('predictions.points')}</Text>
              {bal && bal.claimable > 0 ? (
                <Button
                  title={t('predictions.claim', { points: bal.claimable })}
                  loading={claiming}
                  onPress={() => void claim()}
                />
              ) : null}
              <Text variant="dim" className="mt-1 text-center text-[11px]">
                {t('predictions.earnHint')}
              </Text>
            </Card>

            {/* History */}
            <Card className="gap-1">
              <Text variant="label" className="mb-1 text-pp-gold-deep">
                {t('predictions.history')}
              </Text>
              {predictions.length === 0 ? (
                <Text variant="dim" className="text-[12px]">
                  {t('predictions.empty')}
                </Text>
              ) : (
                predictions.map((p) => (
                  <View key={p.id} className="flex-row items-center gap-3 py-2">
                    <View className="flex-1">
                      <Text className="font-sans-semibold text-pp-text">
                        {p.predictedWinnerName}
                      </Text>
                      <Text variant="dim" className="text-[12px]">
                        {p.tournamentName} · {t('predictions.staked', { points: p.stakePoints })}
                      </Text>
                    </View>
                    {p.status === 'won' ? (
                      <Text className="font-sans-semibold text-pp-success">+{p.payoutPoints}</Text>
                    ) : (
                      <Badge tone={STATUS_TONE[p.status]} label={t(`predictions.status.${p.status}`)} />
                    )}
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </Screen>
    </>
  );
}
