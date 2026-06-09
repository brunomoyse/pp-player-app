import { MotiView } from 'moti';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { useConnectionStore } from '@/stores/useConnectionStore';
import { colors } from '@/theme/tokens';

/** Slim "reconnecting" pill shown while the subscription socket is down, so
 * live data (clock, registrations) is never mistaken for current. */
export function ConnectionBanner() {
  const { t } = useTranslation();
  const wsDown = useConnectionStore((s) => s.wsDown);
  const insets = useSafeAreaInsets();

  if (!wsDown) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 items-center"
      style={{ top: insets.top + 4 }}>
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="flex-row items-center gap-2 rounded-full border border-pp-border bg-pp-surface2 px-3.5 py-1.5">
        <ActivityIndicator size="small" color={colors.gold} />
        <Text variant="muted" className="text-[12px] font-sans-medium">
          {t('common.reconnecting')}
        </Text>
      </MotiView>
    </View>
  );
}
