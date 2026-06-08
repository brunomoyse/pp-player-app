import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/tokens';
import { parseQRCode, type ParsedQRCode } from '@/utils/qrCodeRouter';

export interface QRCodeScannerProps {
  visible: boolean;
  onClose: () => void;
  /** Fires once with the parsed code; the parent decides how to act on it. */
  onScanned: (parsed: ParsedQRCode) => void;
  /** Header title; defaults to the tournament check-in wording. */
  title?: string;
}

export function QRCodeScanner({ visible, onClose, onScanned, title }: QRCodeScannerProps) {
  const { t } = useTranslation();
  const heading = title ?? t('qrScanner.scanTournament');
  const [permission, requestPermission] = useCameraPermissions();
  // `active` is the one-shot guard: it gates onBarcodeScanned and resets when
  // the scanner (re)opens via the adjust-state-on-prop-change pattern.
  const [active, setActive] = useState(true);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setActive(true);
  }

  const handleScan = ({ data }: { data: string }) => {
    if (!active) return;
    setActive(false);
    onScanned(parseQRCode(data));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 bg-pp-bg">
        <View className="flex-row items-center justify-between px-5 pb-3 pt-14">
          <Text variant="heading">{heading}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>

        {!permission ? (
          <View className="flex-1 items-center justify-center" />
        ) : !permission.granted ? (
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <Ionicons name="camera-outline" size={56} color={colors.textDim} />
            <Text variant="muted" className="text-center">
              {heading}
            </Text>
            <Button title={t('common.continue')} onPress={() => void requestPermission()} />
          </View>
        ) : (
          <View className="flex-1">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={active ? handleScan : undefined}
            />
            {/* Reticle overlay */}
            <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
              <View className="h-60 w-60 rounded-3xl border-2 border-pp-gold" />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
