import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { useNotificationPrimerStore } from '@/stores/useNotificationPrimerStore';
import { colors } from '@/theme/tokens';

/**
 * Pre-permission rationale shown before the OS notification dialog. It explains
 * the value (seating, results, achievements) so people can make an informed
 * choice; only "Enable" triggers the system prompt. Driven by
 * useNotificationPrimerStore and mounted once in the root layout.
 */
const BENEFITS = [
  { icon: 'people-outline', key: 'notifications.primerSeating' },
  { icon: 'trophy-outline', key: 'notifications.primerResults' },
  { icon: 'ribbon-outline', key: 'notifications.primerAchievements' },
] as const;

export function NotificationPrimer() {
  const { t } = useTranslation();
  const visible = useNotificationPrimerStore((s) => s.visible);
  const onEnable = useNotificationPrimerStore((s) => s.onEnable);
  const close = useNotificationPrimerStore((s) => s.close);

  const handleEnable = () => {
    onEnable?.();
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View
          accessibilityViewIsModal
          className="w-full max-w-[380px] gap-4 rounded-3xl border border-pp-border-strong bg-pp-surface-2 p-6">
          <View className="h-14 w-14 items-center justify-center self-center rounded-full bg-pp-gold/15">
            <Ionicons name="notifications" size={28} color={colors.gold} />
          </View>

          <View className="gap-1">
            <Text variant="title" className="text-center">
              {t('notifications.primerTitle')}
            </Text>
            <Text variant="muted" className="text-center">
              {t('notifications.primerBody')}
            </Text>
          </View>

          <View className="gap-3 py-1">
            {BENEFITS.map((b) => (
              <View key={b.key} className="flex-row items-center gap-3">
                <Ionicons name={b.icon} size={20} color={colors.gold} />
                <Text variant="body" className="flex-1">
                  {t(b.key)}
                </Text>
              </View>
            ))}
          </View>

          <View className="gap-2">
            <Button
              title={t('notifications.primerEnable')}
              onPress={handleEnable}
              fullWidth
            />
            <Pressable
              onPress={close}
              hitSlop={8}
              accessibilityRole="button"
              className="min-h-[44px] items-center justify-center">
              <Text variant="muted">{t('notifications.primerNotNow')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
