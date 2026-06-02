import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useClubStore } from '@/stores/useClubStore';
import { colors } from '@/theme/tokens';
import type { Club } from '@/types/user';

export function ClubSelector() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const clubs = useClubStore((s) => s.clubs);
  const selected = useClubStore((s) => s.selectedClub);
  const setSelected = useClubStore((s) => s.setSelectedClub);

  const select = (club: Club) => {
    setSelected(club);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        className="h-9 flex-row items-center gap-2 self-start rounded-full border border-pp-border px-3">
        <Ionicons name="location-outline" size={16} color={colors.textMuted} />
        <Text className="font-sans-medium text-[14px] text-pp-text" numberOfLines={1}>
          {selected?.name ?? t('clubs.allClubs', 'All clubs')}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(10,10,12,0.6)' }}>
          <Pressable
            onPress={() => {}}
            className="max-h-[70%] rounded-t-2xl border-t border-pp-border bg-pp-surface pb-8 pt-4">
            <View className="mb-3 flex-row items-center justify-between px-5">
              <Text variant="heading">{t('clubs.selectClub', 'Select club')}</Text>
              <Pressable onPress={() => setOpen(false)} accessibilityRole="button" hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView contentContainerClassName="gap-3 px-5 pt-1">
              {clubs.map((club) => {
                const active = selected?.id === club.id;
                return (
                  <Pressable
                    key={club.id}
                    onPress={() => select(club)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    className={cn(
                      'flex-row items-center justify-between rounded-2xl border p-4',
                      active ? 'border-pp-gold bg-pp-gold/10' : 'border-pp-border bg-white/[0.02]'
                    )}>
                    <View className="flex-1 flex-row items-center gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-xl border border-pp-gold/30 bg-pp-gold/10">
                        <Ionicons name="business-outline" size={20} color={colors.gold} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-sans-semibold text-[16px] text-pp-text" numberOfLines={1}>
                          {club.name}
                        </Text>
                        {club.city ? (
                          <Text variant="muted" className="text-[12px]" numberOfLines={1}>
                            {club.city}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {active ? (
                      <Ionicons name="checkmark-circle" size={24} color={colors.gold} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
