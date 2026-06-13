import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { Badge, Button, Card, IconButton, Text } from '@/components/ui';
import {
  CREATE_PREDICTION,
  GET_MY_PREDICTION_BALANCE,
  GET_MY_PREDICTIONS,
} from '@/graphql/operations';
import { tap } from '@/lib/haptics';
import { colors } from '@/theme/tokens';

const STAKE_STEP = 25;
const DEFAULT_STAKE = 50;

export interface PredictionPlayer {
  userId: string;
  name: string;
}

/**
 * "Predict the winner" — a free fantasy pick staking Prediction Points (G2:
 * never euros, never "betting"). Shown on a tournament before results are in.
 */
export function PredictionCard({
  tournamentId,
  players,
}: {
  tournamentId: string;
  players: PredictionPlayer[];
}) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<string | null>(null);
  const [stake, setStake] = useState(DEFAULT_STAKE);

  const balanceQ = useQuery(GET_MY_PREDICTION_BALANCE);
  const predictionsQ = useQuery(GET_MY_PREDICTIONS);
  const balance = balanceQ.data?.myPredictionBalance.balance ?? 0;

  const existing = useMemo(
    () => (predictionsQ.data?.myPredictions ?? []).find((p) => p.tournamentId === tournamentId),
    [predictionsQ.data, tournamentId],
  );

  const [createPrediction, { loading }] = useMutation(CREATE_PREDICTION, {
    refetchQueries: [{ query: GET_MY_PREDICTION_BALANCE }, { query: GET_MY_PREDICTIONS }],
  });

  if (players.length === 0) return null;

  // Already predicted: show the standing pick.
  if (existing) {
    return (
      <Card className="gap-2">
        <Text variant="label" className="text-pp-gold-deep">
          {t('predictions.yourPick')}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-semibold text-pp-text">{existing.predictedWinnerName}</Text>
          <Badge
            tone={existing.status === 'won' ? 'gold' : 'neutral'}
            label={t(`predictions.status.${existing.status}`)}
          />
        </View>
        <Text variant="dim">
          {t('predictions.staked', { points: existing.stakePoints })}
        </Text>
      </Card>
    );
  }

  const canSubmit = picked && stake > 0 && stake <= balance;

  const onSubmit = async () => {
    if (!picked) return;
    try {
      await createPrediction({
        variables: { tournamentId, predictedWinnerUserId: picked, stakePoints: stake },
      });
      setPicked(null);
    } catch (e) {
      Alert.alert(t('predictions.failed'), e instanceof Error ? e.message : '');
    }
  };

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text variant="label" className="text-pp-gold-deep">
          {t('predictions.predictWinner')}
        </Text>
        <Text variant="dim">
          {t('predictions.balance', { points: balance })}
        </Text>
      </View>

      {/* Player picker */}
      <View className="gap-1">
        {players.map((p) => {
          const active = picked === p.userId;
          return (
            <Pressable
              key={p.userId}
              onPress={() => setPicked(p.userId)}
              accessibilityRole="button"
              className={`flex-row items-center justify-between rounded-xl px-3 py-2 ${
                active ? 'bg-pp-gold/15' : 'bg-white/5'
              }`}>
              <Text className="font-sans-medium text-pp-text">{p.name}</Text>
              {active ? <Ionicons name="checkmark-circle" size={18} color={colors.gold} /> : null}
            </Pressable>
          );
        })}
      </View>

      {/* Stake stepper */}
      <View className="flex-row items-center justify-between">
        <Text className="text-pp-text">{t('predictions.stake')}</Text>
        <View className="flex-row items-center gap-3">
          <IconButton
            name="remove-circle-outline"
            size={26}
            accessibilityLabel={t('predictions.decreaseStake')}
            onPress={() => {
              tap();
              setStake((s) => Math.max(STAKE_STEP, s - STAKE_STEP));
            }}
          />
          <Text className="min-w-[48px] text-center font-sans-semibold text-pp-text">{stake}</Text>
          <IconButton
            name="add-circle-outline"
            size={26}
            accessibilityLabel={t('predictions.increaseStake')}
            onPress={() => {
              tap();
              setStake((s) => Math.min(balance || STAKE_STEP, s + STAKE_STEP));
            }}
          />
        </View>
      </View>

      <Button
        title={t('predictions.placePrediction')}
        loading={loading}
        disabled={!canSubmit}
        onPress={() => void onSubmit()}
      />
      {balance < STAKE_STEP ? (
        <Text variant="dim" className="text-center text-[11px]">
          {t('predictions.needPoints')}
        </Text>
      ) : null}
    </Card>
  );
}
