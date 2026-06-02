import { View } from 'react-native';

import { Screen, Text } from '@/components/ui';

/** Temporary screen scaffold used until Phase 5 wires real data. */
export function Placeholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Screen scroll={false} contentClassName="items-center justify-center">
      <View className="items-center gap-2">
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="muted" className="text-center">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
