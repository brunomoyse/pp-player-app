import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { Badge, Button, Card, EmptyState, LoadingState, Screen, Text } from '@/components/ui';
import { EQUIP_COSMETIC, GET_COSMETIC_CATALOG, PURCHASE_COSMETIC } from '@/graphql/operations';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { CosmeticItem, CosmeticKind } from '@/types/cosmetics';
import { currencyCents } from '@/utils/currency';

const KIND_ICON: Record<CosmeticKind, keyof typeof Ionicons.glyphMap> = {
  card_back: 'albums-outline',
  avatar_frame: 'person-circle-outline',
  theme: 'color-palette-outline',
  badge: 'ribbon-outline',
};

const KIND_ORDER: CosmeticKind[] = ['card_back', 'avatar_frame', 'theme', 'badge'];

export default function CosmeticsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const flags = useFeatureFlags();

  const { data, loading, refetch, networkStatus } = useQuery(GET_COSMETIC_CATALOG, {
    skip: !isAuth || !flags.cosmetics,
    notifyOnNetworkStatusChange: true,
  });

  const [purchase, { loading: buying }] = useMutation(PURCHASE_COSMETIC, {
    refetchQueries: [{ query: GET_COSMETIC_CATALOG }],
  });
  const [equip] = useMutation(EQUIP_COSMETIC, {
    refetchQueries: [{ query: GET_COSMETIC_CATALOG }],
  });

  const grouped = useMemo(() => {
    const items = data?.cosmeticCatalog ?? [];
    return KIND_ORDER.map((kind) => ({
      kind,
      items: items.filter((i) => i.kind === kind),
    })).filter((g) => g.items.length > 0);
  }, [data]);

  const onBuy = (item: CosmeticItem) => {
    Alert.alert(item.name, t('cosmetics.confirmBuy', { price: currencyCents(item.priceCents) }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('cosmetics.buy'),
        onPress: () => void purchase({ variables: { cosmeticItemId: item.id } }),
      },
    ]);
  };

  if (!isAuth) return <Redirect href="/login" />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen
        refreshing={networkStatus === 4}
        onRefresh={() => void refetch()}
        contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
          </Pressable>
          <Text variant="title">{t('cosmetics.title')}</Text>
        </View>

        {!flags.cosmetics ? (
          <EmptyState message={t('common.notYetAvailable')} />
        ) : loading && !data ? (
          <LoadingState label={t('common.loading')} />
        ) : grouped.length === 0 ? (
          <EmptyState icon="color-palette-outline" message={t('cosmetics.empty')} />
        ) : (
          grouped.map((group) => (
            <Card key={group.kind} className="gap-1">
              <Text variant="label" className="mb-1 text-pp-gold-deep">
                {t(`cosmetics.kinds.${group.kind}`)}
              </Text>
              {group.items.map((item) => (
                <View key={item.id} className="flex-row items-center gap-3 py-2">
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                    <Ionicons name={KIND_ICON[item.kind]} size={20} color={colors.gold} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-semibold text-pp-text">{item.name}</Text>
                    {item.description ? (
                      <Text variant="dim" className="text-[12px]">
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                  {item.equipped ? (
                    <Badge tone="gold" label={t('cosmetics.equipped')} />
                  ) : item.owned ? (
                    <Button
                      title={t('cosmetics.equip')}
                      variant="secondary"
                      onPress={() => void equip({ variables: { cosmeticItemId: item.id } })}
                    />
                  ) : (
                    <Button
                      title={currencyCents(item.priceCents)}
                      variant="primary"
                      loading={buying}
                      onPress={() => onBuy(item)}
                    />
                  )}
                </View>
              ))}
            </Card>
          ))
        )}
      </Screen>
    </>
  );
}
