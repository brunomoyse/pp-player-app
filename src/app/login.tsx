import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginScreen() {
  const { t } = useTranslation();
  const setSession = useAuthStore((s) => s.setSession);

  // TEMP (Phase 2): a dev sign-in so the auth-gated tab + Profile/Login toggle
  // can be exercised. Replaced by the real email/password form in Phase 5.
  const devSignIn = async () => {
    await setSession(
      {
        id: 'dev',
        email: 'dev@pocketpair.app',
        firstName: 'Dev',
        username: 'DevPlayer',
        isActive: true,
        role: 'PLAYER',
      },
      'dev-access-token'
    );
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: t('auth.login'), headerShown: true }} />
      <Screen scroll={false} contentClassName="justify-center gap-4">
        <Text variant="title">{t('auth.login')}</Text>
        <Text variant="muted">Email/password form — wired in Phase 5.</Text>
        <View className="gap-2">
          <Button title={`${t('auth.login')} (dev)`} onPress={devSignIn} />
          <Button
            title={t('auth.register', 'Register')}
            variant="secondary"
            onPress={() => router.replace('/register')}
          />
        </View>
      </Screen>
    </>
  );
}
