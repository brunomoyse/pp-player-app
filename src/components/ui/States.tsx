import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/theme/tokens';

import { Button } from './Button';
import { Text } from './Text';

export function LoadingState({ label }: { label?: string }) {
  return (
    <View className="items-center justify-center gap-3 py-12">
      <ActivityIndicator color={colors.gold} />
      {label ? <Text variant="muted">{label}</Text> : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <View className="items-center justify-center gap-3 py-12">
      <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
      <Text variant="muted" className="text-center">
        {message}
      </Text>
      {onRetry ? <Button title={retryLabel} variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({
  icon = 'file-tray-outline',
  message,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
}) {
  return (
    <View className="items-center justify-center gap-3 py-12">
      <Ionicons name={icon} size={56} color={colors.textDim} />
      <Text variant="muted" className="text-center">
        {message}
      </Text>
    </View>
  );
}
