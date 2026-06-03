import '@/lib/logbox';
import '@/global.css';
import '@/i18n';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { ApolloProvider } from '@apollo/client/react';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, DarkTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AchievementCelebration, ErrorBoundary } from '@/components';
import { apolloClient } from '@/graphql/client';
import { loadPersistedLocale } from '@/i18n/useI18n';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const PPDarkTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.gold,
    notification: colors.gold,
  },
};

function GamificationLayer() {
  useAchievementNotifications();
  const show = useGamificationStore((s) => s.show);
  const achievement = useGamificationStore((s) => s.celebration);
  const dismiss = useGamificationStore((s) => s.dismiss);
  return <AchievementCelebration show={show} achievement={achievement} onDismiss={dismiss} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
    void loadPersistedLocale();
  }, [initialize]);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ApolloProvider client={apolloClient}>
        <SafeAreaProvider>
          <ThemeProvider value={PPDarkTheme}>
            <StatusBar style="light" />
            <ErrorBoundary>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                  animation: 'slide_from_right',
                }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" options={{ presentation: 'modal' }} />
                <Stack.Screen name="register" options={{ presentation: 'modal' }} />
                <Stack.Screen name="tournament/[id]" />
                <Stack.Screen name="achievements" />
              </Stack>
              {/* App-wide gamification: notification listener + celebration overlay. */}
              <GamificationLayer />
            </ErrorBoundary>
          </ThemeProvider>
        </SafeAreaProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
