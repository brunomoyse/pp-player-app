import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { timing } from '@/lib/motion';
import { useToastStore, type ToastItem, type ToastType } from '@/stores/useToastStore';
import { colors } from '@/theme/tokens';

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

const ACCENTS: Record<ToastType, string> = {
  success: colors.success,
  error: colors.danger,
  info: colors.gold,
};

function Toast({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    switch (item.type) {
      case 'success':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        break;
    }
    const timer = setTimeout(() => dismiss(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item, dismiss]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: -16, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      exit={{ opacity: 0, translateY: -10, scale: 0.96 }}
      transition={timing(250)}>
      <Pressable
        onPress={() => dismiss(item.id)}
        accessibilityRole="alert"
        accessibilityLabel={item.message}
        className="flex-row items-center gap-2.5 rounded-2xl border border-pp-border bg-pp-surface px-4 py-3 shadow-lg">
        <Ionicons name={ICONS[item.type]} size={20} color={ACCENTS[item.type]} />
        <Text className="flex-1 text-[14px] font-sans-medium text-pp-text" numberOfLines={3}>
          {item.message}
        </Text>
      </Pressable>
    </MotiView>
  );
}

/** Global toast stack — mounted once in the root layout, above all screens. */
export function ToastOverlay() {
  const toasts = useToastStore((s) => s.toasts);
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-4 right-4 gap-2"
      style={{ top: insets.top + 8 }}>
      <AnimatePresence>
        {toasts.map((item) => (
          <Toast key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </View>
  );
}
