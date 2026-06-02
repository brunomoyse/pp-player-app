import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { LOCALE_LABELS, useI18n } from '@/i18n/useI18n';
import { colors } from '@/theme/tokens';

export interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguageModal({ visible, onClose }: LanguageModalProps) {
  const { t } = useTranslation();
  const { locale, setLocale, locales } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(10,10,12,0.6)' }}>
        <Pressable
          onPress={() => {}}
          className="rounded-t-2xl border-t border-pp-border bg-pp-surface pb-8 pt-4">
          <View className="mb-3 flex-row items-center justify-between px-5">
            <Text variant="heading">{t('common.language')}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <View className="gap-2 px-5 pt-1">
            {locales.map((l) => {
              const active = l === locale;
              return (
                <Pressable
                  key={l}
                  onPress={async () => {
                    await setLocale(l);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className={cn(
                    'flex-row items-center justify-between rounded-2xl border p-4',
                    active ? 'border-pp-gold bg-pp-gold/10' : 'border-pp-border bg-white/[0.02]'
                  )}>
                  <Text className="font-sans-semibold text-[16px] text-pp-text">
                    {LOCALE_LABELS[l]}
                  </Text>
                  {active ? <Ionicons name="checkmark-circle" size={22} color={colors.gold} /> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
