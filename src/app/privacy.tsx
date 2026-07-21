import { useMutation, useQuery } from '@apollo/client/react';
import { Redirect, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { Card, LoadingState, Screen, Text } from '@/components/ui';
import { BackButton } from '@/components';
import { GET_MY_PRIVACY_SETTINGS, UPDATE_PRIVACY_SETTINGS } from '@/graphql/operations';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import type { PrivacySettings } from '@/types/scouting';

function ConsentRow({
  title,
  body,
  value,
  onChange,
}: {
  title: string;
  body: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="gap-2 py-2">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 font-sans-semibold text-pp-text">{title}</Text>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ true: colors.gold, false: colors.border }}
          thumbColor={colors.surface}
        />
      </View>
      <Text variant="dim" className="text-[12px] leading-[17px]">
        {body}
      </Text>
    </View>
  );
}

/** Inner form, mounted only once settings are loaded so initial state comes
 *  straight from props (no setState-in-effect). */
function ConsentForm({ initial }: { initial: PrivacySettings }) {
  const { t } = useTranslation();
  const [inPool, setInPool] = useState(initial.inScoutingPool);
  const [update] = useMutation(UPDATE_PRIVACY_SETTINGS);

  const persist = (inPoolNext: boolean) => {
    setInPool(inPoolNext);
    // shareNamedPl is no longer user-facing (the app doesn't show P&L); the
    // required mutation arg round-trips the stored value unchanged.
    void update({
      variables: { shareNamedPl: initial.shareNamedPl, inScoutingPool: inPoolNext },
    });
  };

  return (
    <>
      <Text variant="muted">{t('privacy.intro')}</Text>
      <Card className="gap-1">
        <ConsentRow
          title={t('privacy.poolTitle')}
          body={t('privacy.poolBody')}
          value={inPool}
          onChange={persist}
        />
      </Card>
      <Text variant="dim" className="text-[11px] leading-[16px]">
        {t('privacy.footer')}
      </Text>
    </>
  );
}

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();

  const { data, loading } = useQuery(GET_MY_PRIVACY_SETTINGS, {
    skip: !isAuth,
  });

  if (!isAuth) return <Redirect href="/login" />;

  const settings = data?.myPrivacySettings;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <BackButton />
          <Text variant="title">{t('privacy.title')}</Text>
        </View>

        {loading || !settings ? (
          <LoadingState label={t('common.loading')} />
        ) : (
          <ConsentForm initial={settings} />
        )}
      </Screen>
    </>
  );
}
