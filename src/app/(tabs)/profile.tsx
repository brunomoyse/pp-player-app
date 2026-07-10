import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, Switch, View } from 'react-native';

import {
  CrossClubProfileCard,
  EditProfileModal,
  LanguageModal,
  StatCard,
  StreakCard,
} from '@/components';
import { Avatar, Button, Card, Screen, Text } from '@/components/ui';
import {
  DELETE_MY_ACCOUNT,
  GET_MY_ACHIEVEMENTS,
  GET_MY_NOTIFICATION_PREFERENCES,
  GET_MY_STATISTICS,
  UPDATE_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '@/graphql/operations';
import { LOCALE_LABELS, useI18n } from '@/i18n/useI18n';
import { openLegal } from '@/lib/legal';
import { toast } from '@/lib/toast';
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';
import { currencyCents } from '@/utils/currency';

const DEFAULT_PREFS: NotificationPreferences = {
  tournamentReminders: true,
  registrationUpdates: true,
  seatingUpdates: true,
  achievements: true,
  announcements: true,
};

function fullName(first?: string | null, last?: string | null, username?: string | null) {
  return username ?? ([first, last].filter(Boolean).join(' ') || '-');
}

function PrefSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: colors.gold, false: colors.border }}
      thumbColor={colors.surface}
    />
  );
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
          <Text variant="dim">
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
  const { locale } = useI18n();
  const [editing, setEditing] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const stats = useQuery(GET_MY_STATISTICS, { skip: !isAuth });
  const achievements = useQuery(GET_MY_ACHIEVEMENTS, { skip: !isAuth });

  // Notification preferences: render from local state for instant toggles,
  // seeded from the server value; revert + toast on a failed save.
  const prefsQuery = useQuery(GET_MY_NOTIFICATION_PREFERENCES, { skip: !isAuth });
  const [updatePrefs] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);
  const [deleteAccount] = useMutation(DELETE_MY_ACCOUNT);
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(null);
  const prefs = localPrefs ?? prefsQuery.data?.myNotificationPreferences ?? DEFAULT_PREFS;

  const setPref = (key: keyof NotificationPreferences) => (value: boolean) => {
    const previous = prefs;
    setLocalPrefs({ ...prefs, [key]: value });
    updatePrefs({ variables: { input: { [key]: value } } })
      .then(({ data }) => {
        if (data) setLocalPrefs(data.updateNotificationPreferences);
      })
      .catch(() => {
        setLocalPrefs(previous);
        toast.error(t('profile.preferencesUpdateFailed'));
      });
  };

  const confirmDeleteAccount = () => {
    Alert.alert(t('profile.deleteAccountTitle'), t('profile.deleteAccountMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.deleteAccountConfirm'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('profile.deleteAccountTitle2'), t('profile.deleteAccountMessage2'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('profile.deleteAccountFinal'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteAccount();
                  await logout();
                  toast.success(t('profile.accountDeleted'));
                } catch {
                  toast.error(t('profile.deleteAccountFailed'));
                }
              },
            },
          ]),
      },
    ]);
  };

  if (!isAuth) {
    return (
      <Screen scroll={false} contentClassName="justify-between">
        {/* Brand block sits in the upper space; CTAs anchor to the bottom. */}
        <View className="flex-1 items-center justify-center gap-4">
          <Image
            source={require('../../../assets/images/icon-no-bg.png')}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
            accessibilityLabel="PocketPair"
          />
          <View className="items-center gap-1.5">
            <Text variant="title">{t('auth.guestHeadline')}</Text>
            <Text variant="muted" className="px-4 text-center">
              {t('home.ctaDescription')}
            </Text>
          </View>
        </View>

        <View className="gap-2 pb-2">
          <Button title={t('auth.login')} onPress={() => router.push('/login')} />
          <Button
            title={t('auth.createAccount')}
            variant="secondary"
            onPress={() => router.push('/register')}
          />
          {/* Language is available without an account. */}
          <Pressable
            onPress={() => setLangOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('common.language')}
            testID="open-language"
            className="mt-1 flex-row items-center justify-center gap-2 self-center rounded-full border border-pp-border px-4 py-2">
            <Ionicons name="language-outline" size={16} color={colors.gold} />
            <Text className="font-sans-medium text-pp-text">
              {t('common.language')} · {LOCALE_LABELS[locale]}
            </Text>
          </Pressable>
        </View>

        <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} />
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
        <Avatar
          name={fullName(user?.firstName, user?.lastName, user?.username)}
          size={88}
          ring
        />
        <View className="items-center gap-1">
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
          icon={<MaterialCommunityIcons name="cards-playing-outline" size={20} color={colors.gold} />}
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

      {/* Attendance streak — the consecutive-event flame */}
      <StreakCard />

      {/* Poker passport — cross-club identity */}
      <CrossClubProfileCard />

      {/* Progress & play */}
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
          icon="megaphone-outline"
          title={t('announcements.title')}
          subtitle={t('announcements.subtitle')}
          onPress={() => router.push('/announcements')}
        />
        <Setting
          icon="trophy-outline"
          title={t('season.title')}
          subtitle={t('season.subtitle')}
          onPress={() => router.push('/season')}
        />
        <Setting
          icon="people-outline"
          title={t('friends.title')}
          subtitle={t('friends.subtitle')}
          onPress={() => router.push('/friends')}
        />
        <Setting
          icon="sparkles-outline"
          title={t('wrapped.title')}
          subtitle={t('wrapped.subtitle')}
          onPress={() => router.push('/wrapped')}
        />
      </Card>

      {/* Tools — drink wallet is always available; the rest are feature-flagged. */}
      <Card className="gap-1">
        <Text variant="label" className="mb-1 text-pp-gold-deep">
          {t('profile.tools')}
        </Text>
        <Setting
          icon="wine-outline"
          title={t('drinkWallet.title')}
          subtitle={t('drinkWallet.subtitle')}
          onPress={() => router.push('/drink-wallet')}
        />
        <Setting
          icon="reader-outline"
          title={t('notes.title')}
          subtitle={t('notes.privateSubtitle')}
          onPress={() => router.push('/notes')}
        />
        <Setting
          icon="stats-chart-outline"
          title={t('analytics.title')}
          subtitle={t('analytics.subtitle')}
          onPress={() => router.push('/analytics')}
        />
        <Setting
          icon="search-outline"
          title={t('scouting.title')}
          subtitle={t('scouting.subtitle')}
          onPress={() => router.push('/scouting')}
        />
      </Card>

      {/* Tournaments */}
      <Card className="gap-1">
        <Text variant="label" className="mb-1 text-pp-gold-deep">
          {t('profile.tournaments')}
        </Text>
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

      {/* Notification preferences (persisted server-side, gates pushes too) */}
      <Card className="gap-1">
        <Text variant="label" className="mb-1 text-pp-gold-deep">
          {t('profile.notifications')}
        </Text>
        <Setting
          icon="alarm-outline"
          title={t('profile.prefTournamentReminders')}
          subtitle={t('profile.prefTournamentRemindersHint')}
          right={<PrefSwitch value={prefs.tournamentReminders} onChange={setPref('tournamentReminders')} />}
        />
        <Setting
          icon="ticket-outline"
          title={t('profile.prefRegistrationUpdates')}
          subtitle={t('profile.prefRegistrationUpdatesHint')}
          right={<PrefSwitch value={prefs.registrationUpdates} onChange={setPref('registrationUpdates')} />}
        />
        <Setting
          icon="swap-horizontal-outline"
          title={t('profile.prefSeatingUpdates')}
          subtitle={t('profile.prefSeatingUpdatesHint')}
          right={<PrefSwitch value={prefs.seatingUpdates} onChange={setPref('seatingUpdates')} />}
        />
        <Setting
          icon="ribbon-outline"
          title={t('profile.prefAchievements')}
          subtitle={t('profile.prefAchievementsHint')}
          right={<PrefSwitch value={prefs.achievements} onChange={setPref('achievements')} />}
        />
        <Setting
          icon="megaphone-outline"
          title={t('profile.prefAnnouncements')}
          subtitle={t('profile.prefAnnouncementsHint')}
          right={<PrefSwitch value={prefs.announcements} onChange={setPref('announcements')} />}
        />
      </Card>

      {/* Settings */}
      <Card className="gap-1">
        <Text variant="label" className="mb-1 text-pp-gold-deep">
          {t('profile.settings')}
        </Text>
        <Setting
          icon="language-outline"
          title={t('common.language')}
          subtitle={LOCALE_LABELS[locale]}
          onPress={() => setLangOpen(true)}
        />
        <Setting
          icon="shield-checkmark-outline"
          title={t('privacy.title')}
          subtitle={t('privacy.subtitle')}
          onPress={() => router.push('/privacy')}
        />
      </Card>

      {/* Legal — links out to the marketing-site policy pages (18+ context). */}
      <Card className="gap-1">
        <Text variant="label" className="mb-1 text-pp-gold-deep">
          {t('legal.sectionTitle')}
        </Text>
        <Setting
          icon="document-text-outline"
          title={t('legal.termsOfService')}
          onPress={() => openLegal('terms')}
        />
        <Setting
          icon="lock-closed-outline"
          title={t('legal.privacyPolicy')}
          onPress={() => openLegal('privacy')}
        />
        <Text variant="dim" className="px-1 pt-1 text-[12px]">
          {t('legal.responsibleGaming')}
        </Text>
      </Card>

      <Button title={t('profile.logout')} variant="danger" onPress={() => void logout()} />

      {/* Account deletion (App Store / GDPR requirement) — double-confirmed. */}
      <Pressable
        onPress={confirmDeleteAccount}
        accessibilityRole="button"
        accessibilityLabel={t('profile.deleteAccount')}
        testID="delete-account"
        hitSlop={8}
        className="items-center pb-2">
        <Text className="text-[13px] font-sans-medium text-pp-danger/80">
          {t('profile.deleteAccount')}
        </Text>
      </Pressable>

      <EditProfileModal visible={editing} onClose={() => setEditing(false)} />
      <LanguageModal visible={langOpen} onClose={() => setLangOpen(false)} />
    </Screen>
  );
}
