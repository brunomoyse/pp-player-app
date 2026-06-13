import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, View } from 'react-native';

import { BackButton, QRCodeScanner } from '@/components';
import { Button, Card, EmptyState, Input, LoadingState, Screen, Text } from '@/components/ui';
import { CLAIM_CARD, GET_DRINK_WALLET } from '@/graphql/operations';
import { useI18n } from '@/i18n/useI18n';
import { useClubStore } from '@/stores/useClubStore';
import { useDrinkWalletStore } from '@/stores/useDrinkWalletStore';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { DrinkLedgerEntry, DrinkLedgerReason } from '@/types/drinkWallet';
import { formatDate } from '@/utils/datetime';
import { extractDrinkToken, type ParsedQRCode } from '@/utils/qrCodeRouter';

const REASON_KEY: Record<DrinkLedgerReason, string> = {
  TournamentTopup: 'tournamentTopup',
  BarRedemption: 'barRedemption',
  Expiry: 'expiry',
  Adjustment: 'adjustment',
  Transfer: 'transfer',
};

type RegisterRefetch = (id: string, refetch: () => Promise<unknown>) => () => void;

function LedgerRow({ entry }: { entry: DrinkLedgerEntry }) {
  const { t } = useTranslation();
  const { locale } = useI18n();
  const positive = entry.delta > 0;
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className="flex-1">
        <Text className="font-sans-semibold text-pp-text">
          {t(`drinkWallet.reason.${REASON_KEY[entry.reason]}`)}
        </Text>
        <Text variant="dim">
          {formatDate(entry.createdAt, locale)}
          {entry.expiresAt
            ? ` · ${t('drinkWallet.expiresOn', { date: formatDate(entry.expiresAt, locale) })}`
            : ''}
        </Text>
      </View>
      <Text className={`font-mono-medium text-base ${positive ? 'text-pp-success' : 'text-pp-text'}`}>
        {positive ? '+' : ''}
        {entry.delta}
      </Text>
    </View>
  );
}

function DrinkWalletCard({
  walletId,
  clubName,
  registerRefetch,
}: {
  walletId: string;
  clubName: string;
  registerRefetch: RegisterRefetch;
}) {
  const { t } = useTranslation();
  const q = useQuery(GET_DRINK_WALLET, {
    variables: { walletId },
    notifyOnNetworkStatusChange: true,
  });

  // Register this card's refetch so the screen's pull-to-refresh can fan out.
  const refetch = q.refetch;
  useEffect(() => registerRefetch(walletId, refetch), [walletId, refetch, registerRefetch]);

  const wallet = q.data?.drinkWallet;
  const showPlaceholder = q.loading && !wallet;

  return (
    <Card highlighted className="gap-3 py-5">
      <View className="items-center gap-1">
        <Text variant="label" className="text-pp-gold-deep">
          {clubName || t('drinkWallet.balanceLabel')}
        </Text>
        <Text className="font-sans-bold text-4xl text-pp-gold">
          {showPlaceholder ? '—' : (wallet?.balance ?? 0)}
        </Text>
        <Text variant="muted">{t('drinkWallet.creditsUnit', { count: wallet?.balance ?? 0 })}</Text>
      </View>

      <View className="gap-1">
        <Text variant="label" className="mb-1 text-pp-gold-deep">
          {t('drinkWallet.history')}
        </Text>
        {!wallet || wallet.recentEntries.length === 0 ? (
          <Text variant="dim">
            {t('drinkWallet.noActivity')}
          </Text>
        ) : (
          wallet.recentEntries.map((e) => <LedgerRow key={e.id} entry={e} />)
        )}
      </View>
    </Card>
  );
}

export default function DrinkWalletScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const clubs = useClubStore((s) => s.clubs);
  const claimedWallets = useDrinkWalletStore((s) => s.claimedWallets);
  const addClaimedWallet = useDrinkWalletStore((s) => s.addClaimedWallet);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refetchers = useRef(new Map<string, () => Promise<unknown>>());
  const registerRefetch = useCallback<RegisterRefetch>((id, refetch) => {
    refetchers.current.set(id, refetch);
    return () => {
      refetchers.current.delete(id);
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([...refetchers.current.values()].map((f) => f()));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const [claim, { loading: claiming }] = useMutation(CLAIM_CARD);

  const handleToken = useCallback(
    async (token: string | null) => {
      if (!token) {
        Alert.alert(t('drinkWallet.title'), t('drinkWallet.error.invalidCode'));
        return;
      }
      try {
        const { data } = await claim({ variables: { credentialToken: token } });
        const payload = data?.claimCard;
        if (payload?.wallet) {
          addClaimedWallet(payload.wallet);
          Alert.alert(t('drinkWallet.title'), payload.message || t('drinkWallet.linked'));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message.toLowerCase() : '';
        let copy = t('drinkWallet.error.generic');
        if (msg.includes('another account')) copy = t('drinkWallet.error.ownedByOther');
        else if (msg.includes('already have')) copy = t('drinkWallet.error.alreadyHaveWallet');
        Alert.alert(t('drinkWallet.title'), copy);
      }
    },
    [claim, addClaimedWallet, t]
  );

  const onScanned = useCallback(
    (parsed: ParsedQRCode) => {
      setScannerOpen(false);
      void handleToken(extractDrinkToken(parsed));
    },
    [handleToken]
  );

  const submitManual = useCallback(async () => {
    const token = extractDrinkToken(manualValue.trim());
    if (!token) {
      setManualError(t('drinkWallet.error.invalidCode'));
      return;
    }
    setManualError(null);
    setManualOpen(false);
    setManualValue('');
    await handleToken(token);
  }, [manualValue, handleToken, t]);

  if (!isAuth) return <Redirect href="/login" />;

  const clubName = (clubId: string) => clubs.find((c) => c.id === clubId)?.name ?? '';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen refreshing={refreshing} onRefresh={onRefresh} contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('drinkWallet.title')}</Text>
        </View>

        {claimedWallets.length === 0 ? (
          <Card className="items-center gap-4 py-8">
            <Ionicons name="wine-outline" size={48} color={colors.textDim} />
            <EmptyState message={t('drinkWallet.empty')} />
          </Card>
        ) : (
          claimedWallets.map((w) => (
            <DrinkWalletCard
              key={w.id}
              walletId={w.id}
              clubName={clubName(w.clubId)}
              registerRefetch={registerRefetch}
            />
          ))
        )}

        {/* Claim affordances */}
        <View className="gap-2">
          <Button
            title={t('drinkWallet.linkCard')}
            loading={claiming}
            onPress={() => setScannerOpen(true)}
          />
          <Button
            title={t('drinkWallet.enterCode')}
            variant="secondary"
            onPress={() => {
              setManualError(null);
              setManualOpen(true);
            }}
          />
        </View>

        {claiming ? <LoadingState label={t('drinkWallet.linking')} /> : null}
      </Screen>

      <QRCodeScanner
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={onScanned}
        title={t('drinkWallet.linkCard')}
      />

      {/* Manual code entry */}
      <Modal
        visible={manualOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setManualOpen(false)}>
        <Pressable
          onPress={() => setManualOpen(false)}
          className="flex-1 items-center justify-center bg-black/60 px-6">
          <View
            onStartShouldSetResponder={() => true}
            accessibilityViewIsModal
            className="w-full">
            <Card className="w-full gap-4">
              <Text variant="heading">{t('drinkWallet.enterCode')}</Text>
            <Input
              label={t('drinkWallet.manualPrompt')}
              value={manualValue}
              onChangeText={setManualValue}
              error={manualError}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              placeholder="••••••••"
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  title={t('common.cancel')}
                  variant="secondary"
                  onPress={() => setManualOpen(false)}
                />
              </View>
              <View className="flex-1">
                <Button
                  title={t('drinkWallet.linkCard')}
                  loading={claiming}
                  onPress={() => void submitManual()}
                />
              </View>
            </View>
            </Card>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
