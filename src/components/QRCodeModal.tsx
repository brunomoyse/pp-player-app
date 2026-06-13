import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { IconButton, Text } from '@/components/ui';

export interface QRCodeModalProps {
  visible: boolean;
  /** Tournament id encoded as the check-in payload. */
  tournamentId: string | null;
  onClose: () => void;
}

/** Displays a CHECKIN QR a tournament manager can scan to check the player in. */
export function QRCodeModal({ visible, tournamentId, onClose }: QRCodeModalProps) {
  const { t } = useTranslation();
  const value = tournamentId ? `CHECKIN:${tournamentId}` : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: 'rgba(10,10,12,0.72)' }}>
        <View
          onStartShouldSetResponder={() => true}
          accessibilityViewIsModal
          className="w-full max-w-[340px] items-center gap-4 rounded-2xl border border-pp-border bg-pp-surface p-6">
          <View className="w-full flex-row items-center justify-between">
            <Text variant="heading">{t('mySeats.qrCode.title')}</Text>
            <IconButton name="close" size={22} accessibilityLabel={t('common.close')} onPress={onClose} />
          </View>

          {value ? (
            <View className="rounded-2xl bg-white p-4">
              <QRCode value={value} size={220} backgroundColor="#ffffff" color="#18181a" />
            </View>
          ) : (
            <Text variant="muted">{t('mySeats.qrCode.error')}</Text>
          )}

          <Text variant="muted" className="text-center text-[13px]">
            {t('mySeats.qrCode.instructions')}
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
}
