import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const user = useAuthStore((s) => s.currentUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  if (!isAuth) {
    return (
      <Screen scroll={false} contentClassName="items-center justify-center gap-4">
        <Text variant="title">{t('auth.login')}</Text>
        <Text variant="muted" className="text-center">
          {t('home.guestSubtitle', 'Sign in to track your tournaments.')}
        </Text>
        <Button title={t('auth.login')} onPress={() => router.push('/login')} />
      </Screen>
    );
  }

  return (
    <Screen contentClassName="gap-4">
      <Text variant="title">{user?.username ?? user?.firstName ?? t('nav.me')}</Text>
      <Card>
        <Text variant="muted">Profile stats, edit + settings — wired in Phase 5.</Text>
      </Card>
      <Button
        title={t('achievements.title')}
        variant="secondary"
        onPress={() => router.push('/achievements')}
      />
      <View className="mt-2">
        <Button title={t('profile.logout')} variant="danger" onPress={() => clearSession()} />
      </View>
    </Screen>
  );
}
