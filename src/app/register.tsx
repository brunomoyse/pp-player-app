import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button, Screen, Text } from '@/components/ui';

export default function RegisterScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('auth.register', 'Register'), headerShown: true }} />
      <Screen scroll={false} contentClassName="justify-center gap-4">
        <Text variant="title">{t('auth.register', 'Register')}</Text>
        <Text variant="muted">Registration form — wired in Phase 5.</Text>
        <Button title={t('auth.login')} variant="secondary" onPress={() => router.replace('/login')} />
      </Screen>
    </>
  );
}
