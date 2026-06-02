import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { colors } from '@/theme/tokens';

export interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: ReactNode;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card className="flex-1 gap-2">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/5">
        <Ionicons name={icon} size={20} color={colors.gold} />
      </View>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text variant="title">{value}</Text>
      ) : (
        value
      )}
      <Text variant="muted">{label}</Text>
    </Card>
  );
}
