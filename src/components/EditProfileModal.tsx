import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/theme/tokens';

export interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Local profile editor. The backend exposes no updateUser mutation yet (the web
 * EditProfileModal is likewise a local stub), so Save updates the cached user.
 */
export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.currentUser);
  const setUser = useAuthStore((s) => s.setUser);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');

  const save = () => {
    if (user) setUser({ ...user, firstName, lastName, username });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(10,10,12,0.6)' }}>
        <Pressable
          onPress={() => {}}
          className="max-h-[85%] rounded-t-2xl border-t border-pp-border bg-pp-surface pb-8 pt-4">
          <View className="mb-3 flex-row items-center justify-between px-5">
            <Text variant="heading">{t('profile.editProfile')}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-4 px-5 pt-1">
            <Input label={t('profile.firstName')} value={firstName} onChangeText={setFirstName} />
            <Input label={t('profile.lastName')} value={lastName} onChangeText={setLastName} />
            <Input
              label={t('profile.username')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button title={t('profile.save')} onPress={save} className="mt-2" />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
