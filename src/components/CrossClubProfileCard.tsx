import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { GET_MY_CROSS_CLUB_PROFILE } from '@/graphql/operations';
import { colors } from '@/theme/tokens';

/**
 * Poker passport: the player's portable identity across every club they belong
 * to. Backed by the cross-club roster (`myCrossClubProfile`). Kept free — it is
 * the network-effect engine, so it stays out of any paid tier.
 */
export function CrossClubProfileCard() {
  const { t } = useTranslation();
  const { data, loading } = useQuery(GET_MY_CROSS_CLUB_PROFILE);
  const memberships = data?.myCrossClubProfile ?? [];

  return (
    <Card className="gap-2">
      <Text variant="label" className="mb-1 text-pp-gold-deep">
        {t('profile.passport')}
      </Text>

      {memberships.length === 0 ? (
        <Text variant="dim" className="text-[12px]">
          {loading ? t('common.loading') : t('profile.noClubsYet')}
        </Text>
      ) : (
        memberships.map((m) => (
          <View key={m.id} className="flex-row items-center gap-3 rounded-xl px-1 py-2">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <Ionicons name="business-outline" size={18} color={colors.gold} />
            </View>
            <View className="flex-1">
              <Text className="font-sans-semibold text-pp-text">{m.club?.name ?? '-'}</Text>
              <Text variant="dim" className="text-[12px]">
                {m.displayName}
                {m.club?.city ? ` · ${m.club.city}` : ''}
              </Text>
            </View>
          </View>
        ))
      )}
    </Card>
  );
}
