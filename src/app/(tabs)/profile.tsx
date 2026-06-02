import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Switch, View } from 'react-native';

import { EditProfileModal, StatCard } from '@/components';
import { Avatar, Button, Card, Screen, Text } from '@/components/ui';
import { GET_MY_ACHIEVEMENTS, GET_MY_STATISTICS } from '@/graphql/operations';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import { currencyCents } from '@/utils/currency';

function fullName(first?: string | null, last?: string | null, username?: string | null) {
  return username ?? ([first, last].filter(Boolean).join(' ') || '—');
}

function Setting({
  icon,
  title,
  subtitle,
  onPress,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className="flex-row items-center gap-3 rounded-xl px-1 py-2.5">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
        <Ionicons name={icon} size={18} color={colors.gold} />
      </View>
      <View className="flex-1">
        <Text className="font-sans-semibold text-pp-text">{title}</Text>
        {subtitle ? (
          <Text variant="dim" className="text-[12px]">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textDim} /> : null)}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const isAuth = useIsAuthenticated();
  const user = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const stats = useQuery(GET_MY_STATISTICS, { skip: !isAuth });
  const achievements = useQuery(GET_MY_ACHIEVEMENTS, { skip: !isAuth });

  if (!isAuth) {
    return (
      <Screen scroll={false} contentClassName="items-center justify-center gap-4">
        <Avatar size={72} />
        <Text variant="title">{t('auth.login')}</Text>
        <Text variant="muted" className="text-center">
          {t('home.ctaDescription')}
        </Text>
        <View className="w-full gap-2">
          <Button title={t('auth.login')} onPress={() => router.push('/login')} />
          <Button
            title={t('auth.createAccount')}
            variant="secondary"
            onPress={() => router.push('/register')}
          />
        </View>
      </Screen>
    );
  }

  const block = stats.data?.myTournamentStatistics.lastYear;
  const unlocked = (achievements.data?.myAchievements ?? []).filter((a) => !a.isLocked).length;
  const total = achievements.data?.myAchievements.length ?? 0;

  return (
    <Screen contentClassName="gap-5">
      {/* Header */}
      <View className="items-center gap-3 pt-2">
        <Avatar name={fullName(user?.firstName, user?.lastName, user?.username)} size={88} ring />
        <View className="items-center">
          <Text variant="title">{fullName(user?.firstName, user?.lastName, user?.username)}</Text>
          <Text variant="muted">{user?.email}</Text>
        </View>
        <Button
          title={t('profile.editProfile')}
          variant="secondary"
          onPress={() => setEditing(true)}
        />
      </View>

      {/* Stats */}
      <View className="flex-row gap-3">
        <StatCard
          icon="game-controller-outline"
          value={block?.totalTournaments ?? 0}
          label={t('profile.tournaments')}
        />
        <StatCard
          icon="cash-outline"
          value={currencyCents(block?.totalWinnings ?? 0)}
          label={t('profile.totalWinnings')}
        />
        <StatCard
          icon="trophy-outline"
          value={`${Math.round(block?.itmPercentage ?? 0)}%`}
          label={t('profile.itmRate')}
        />
      </View>

      {/* Quick actions */}
      <Card className="gap-1">
        <Text variant="label" className="mb-1 text-pp-gold-deep">
          {t('profile.quickActions')}
        </Text>
        <Setting
          icon="ribbon-outline"
          title={t('profile.achievements')}
          subtitle={`${unlocked}/${total} ${t('profile.unlocked')}`}
          onPress={() => router.push('/achievements')}
        />
        <Setting
          icon="ticket-outline"
          title={t('profile.myRegistrations')}
          onPress={() => router.push('/my-seats')}
        />
        <Setting
          icon="calendar-outline"
          title={t('profile.browseTournaments')}
          subtitle={t('profile.viewUpcomingEvents')}
          onPress={() => router.push('/tournaments')}
        />
      </Card>

      {/* Settings */}
      <Card className="gap-1">
        <Text variant="label" className="mb-1 text-pp-gold-deep">
          {t('profile.settings')}
        </Text>
        <Setting
          icon="notifications-outline"
          title={t('profile.notifications')}
          subtitle={t('profile.tournamentAlerts')}
          right={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.gold, false: colors.border }}
              thumbColor={colors.surface}
            />
          }
        />
      </Card>

      <Button title={t('profile.logout')} variant="danger" onPress={() => void logout()} />

      <EditProfileModal visible={editing} onClose={() => setEditing(false)} />
    </Screen>
  );
}
