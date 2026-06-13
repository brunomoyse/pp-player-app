import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Share, View } from 'react-native';

import { Button, Card, EmptyState, LoadingState, Screen, Text } from '@/components/ui';
import { BackButton } from '@/components';
import { GET_MY_YEAR_IN_POKER } from '@/graphql/operations';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { YearInPoker } from '@/types/social';
import { currencyCents } from '@/utils/currency';

function StatLine({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/5">
        <Ionicons name={icon} size={16} color={colors.gold} />
      </View>
      <Text className="flex-1 text-pp-text">{label}</Text>
      <Text className="font-sans-semibold text-pp-text">{value}</Text>
    </View>
  );
}

export default function WrappedScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();

  const { data, loading } = useQuery(GET_MY_YEAR_IN_POKER, { skip: !isAuth });
  const w = data?.myYearInPoker;

  if (!isAuth) return <Redirect href="/login" />;

  const onShare = (recap: YearInPoker) => {
    const lines = [
      t('wrapped.shareHeader', { year: recap.year }),
      t('wrapped.tournaments') + ': ' + recap.tournaments,
      t('wrapped.net') + ': ' + currencyCents(recap.netCents),
      t('wrapped.itm') + ': ' + recap.itmCount,
      recap.longestStreak ? t('wrapped.streak') + ': ' + recap.longestStreak : null,
    ].filter(Boolean);
    void Share.share({ message: lines.join('\n') });
  };

  const hasData = !!w && (w.tournaments > 0 || w.checkIns > 0);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('wrapped.title')}</Text>
        </View>

        {loading && !data ? (
          <LoadingState label={t('common.loading')} />
        ) : !hasData ? (
          <EmptyState icon="sparkles-outline" message={t('wrapped.empty')} />
        ) : (
          <>
            {/* Hero */}
            <Card highlighted className="items-center gap-1 py-6">
              <Text variant="label" className="text-pp-gold-deep">
                {t('wrapped.yourYear', { year: w!.year })}
              </Text>
              <Text className="font-sans-bold text-4xl text-pp-gold">
                {currencyCents(w!.netCents)}
              </Text>
              <Text variant="muted">{t('wrapped.net')}</Text>
            </Card>

            {/* Stats */}
            <Card className="gap-1">
              <StatLine
                icon="albums-outline"
                label={t('wrapped.tournaments')}
                value={String(w!.tournaments)}
              />
              <StatLine
                icon="cash-outline"
                label={t('wrapped.winnings')}
                value={currencyCents(w!.winningsCents)}
              />
              <StatLine icon="trophy-outline" label={t('wrapped.itm')} value={String(w!.itmCount)} />
              {w!.bestFinish ? (
                <StatLine
                  icon="medal-outline"
                  label={t('wrapped.bestFinish')}
                  value={`#${w!.bestFinish}`}
                />
              ) : null}
              <StatLine
                icon="qr-code-outline"
                label={t('wrapped.checkIns')}
                value={String(w!.checkIns)}
              />
              {w!.longestStreak ? (
                <StatLine
                  icon="flame-outline"
                  label={t('wrapped.streak')}
                  value={String(w!.longestStreak)}
                />
              ) : null}
              {w!.favoriteClub ? (
                <StatLine
                  icon="business-outline"
                  label={t('wrapped.favoriteClub')}
                  value={w!.favoriteClub}
                />
              ) : null}
              {w!.nemesisName ? (
                <StatLine
                  icon="flash-outline"
                  label={t('wrapped.nemesis')}
                  value={w!.nemesisName}
                />
              ) : null}
            </Card>

            <Button title={t('wrapped.share')} onPress={() => onShare(w!)} />
          </>
        )}
      </Screen>
    </>
  );
}
