import { useLazyQuery, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Avatar, Badge, Card, Input, Screen, Text } from '@/components/ui';
import { BackButton } from '@/components';
import {
  GET_MY_SCOUTING_QUOTA,
  SCOUTING_PROFILE,
  SCOUTING_SEARCH,
} from '@/graphql/operations';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import { currencyCents } from '@/utils/currency';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text variant="title">{value}</Text>
      <Text variant="micro">
        {label}
      </Text>
    </View>
  );
}

export default function ScoutingScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const [query, setQuery] = useState('');

  const quotaQ = useQuery(GET_MY_SCOUTING_QUOTA, { skip: !isAuth });
  const searchQ = useQuery(SCOUTING_SEARCH, {
    variables: { query: query.trim() },
    skip: !isAuth || query.trim().length < 2,
  });

  const [loadProfile, profileQ] = useLazyQuery(SCOUTING_PROFILE);

  const onSelect = async (userId: string) => {
    await loadProfile({ variables: { userId } });
    // Viewing a new profile may consume a free lookup — refresh the quota.
    void quotaQ.refetch();
  };

  if (!isAuth) return <Redirect href="/login" />;

  const quota = quotaQ.data?.myScoutingQuota;
  const matches = searchQ.data?.scoutingSearch ?? [];
  const profile = profileQ.data?.scoutingProfile;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('scouting.title')}</Text>
        </View>

        <>
            {/* Quota */}
            {quota ? (
              <Text variant="dim">
                {quota.unlimited
                  ? t('scouting.unlimited')
                  : t('scouting.quota', { used: quota.used, limit: quota.limit })}
              </Text>
            ) : null}

            <Input
              placeholder={t('scouting.searchPlaceholder')}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />

            {/* Selected profile */}
            {profileQ.error ? (
              <Card className="gap-1">
                <Text className="font-sans-semibold text-pp-danger">
                  {t('scouting.lookupError')}
                </Text>
                <Text variant="dim">
                  {t('scouting.lookupErrorBody')}
                </Text>
              </Card>
            ) : profile ? (
              <Card highlighted className="gap-3">
                <View className="flex-row items-center gap-3">
                  <Avatar name={profile.handle} size={48} ring />
                  <Text variant="heading" className="flex-1">
                    {profile.handle}
                  </Text>
                </View>
                <View className="flex-row">
                  <Stat label={t('scouting.tournaments')} value={String(profile.tournaments)} />
                  <Stat
                    label={t('scouting.itm')}
                    value={`${Math.round(profile.itmPercentage)}%`}
                  />
                  <Stat
                    label={t('scouting.best')}
                    value={profile.bestFinish ? `#${profile.bestFinish}` : '-'}
                  />
                </View>
                <View className="flex-row items-center justify-between border-t border-pp-border pt-2">
                  <Text className="text-pp-text">{t('scouting.pnl')}</Text>
                  {profile.sharesPnl && profile.netCents != null ? (
                    <Text
                      className={
                        profile.netCents >= 0
                          ? 'font-sans-semibold text-pp-success'
                          : 'font-sans-semibold text-pp-danger'
                      }>
                      {currencyCents(profile.netCents)}
                    </Text>
                  ) : (
                    <Badge tone="neutral" label={t('scouting.pnlPrivate')} />
                  )}
                </View>
              </Card>
            ) : null}

            {/* Search results */}
            <Card className="gap-1">
              <Text variant="label" className="mb-1 text-pp-gold-deep">
                {t('scouting.results')}
              </Text>
              {query.trim().length < 2 ? (
                <Text variant="dim">
                  {t('scouting.hint')}
                </Text>
              ) : matches.length === 0 ? (
                <Text variant="dim">
                  {t('scouting.noResults')}
                </Text>
              ) : (
                matches.map((m) => (
                  <Pressable
                    key={m.userId}
                    onPress={() => void onSelect(m.userId)}
                    accessibilityRole="button"
                    accessibilityHint={t('scouting.a11y.openHint')}
                    className="flex-row items-center gap-3 rounded-xl px-1 py-2">
                    <Avatar name={m.handle} size={36} />
                    <Text className="flex-1 font-sans-semibold text-pp-text">{m.handle}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
                  </Pressable>
                ))
              )}
            </Card>
        </>
      </Screen>
    </>
  );
}
