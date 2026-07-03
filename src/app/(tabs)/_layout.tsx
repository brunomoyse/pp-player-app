import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { useIsAuthenticated } from '@/stores/useAuthStore';
import { colors, fonts } from '@/theme/tokens';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IoniconName) {
  const TabIcon = ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} size={size} color={color as string} />
  );
  TabIcon.displayName = `TabIcon(${name})`;
  return TabIcon;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t('nav.home'), tabBarIcon: tabIcon('home'), tabBarButtonTestID: 'tab-home' }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{ title: t('nav.events'), tabBarIcon: tabIcon('calendar'), tabBarButtonTestID: 'tab-events' }}
      />
      <Tabs.Screen
        name="my-seats"
        options={{
          title: t('nav.mySeats'),
          tabBarIcon: tabIcon('ticket'),
          tabBarButtonTestID: 'tab-my-seats',
          // Hide the auth-only tab for guests (mirrors the web app).
          href: isAuth ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{ title: t('nav.leaders'), tabBarIcon: tabIcon('trophy'), tabBarButtonTestID: 'tab-leaderboard' }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isAuth ? t('nav.me') : t('nav.login'),
          tabBarIcon: tabIcon(isAuth ? 'person' : 'log-in'),
          tabBarButtonTestID: 'tab-profile',
        }}
      />
    </Tabs>
  );
}
