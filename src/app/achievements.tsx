import { Redirect, Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen, Text } from '@/components/ui';
import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  if (!isAuth) return <Redirect href="/login" />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen contentClassName="gap-4">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} accessibilityLabel={t('common.back')} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.textMuted} />
          </Pressable>
          <Text variant="title">{t('achievements.title')}</Text>
        </View>
        <Text variant="muted">Achievement grid + celebration — wired in Phase 5/6.</Text>
      </Screen>
    </>
  );
}
