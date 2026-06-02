import { View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { AnimatedNumber, FadeUp, Pressable, Stagger } from '@/components/motion';

// Phase 4 spike: exercises the motion primitives. Becomes the real dashboard in Phase 5.
export default function HomeScreen() {
  return (
    <Screen contentClassName="gap-4">
      <FadeUp>
        <Text variant="gold">Motion check</Text>
      </FadeUp>

      <View className="flex-row gap-3">
        <Card className="flex-1 items-center">
          <AnimatedNumber value={47} variant="title" className="text-pp-gold" />
          <Text variant="muted">Wins</Text>
        </Card>
        <Card className="flex-1 items-center">
          <AnimatedNumber value={34} suffix="%" variant="title" className="text-pp-gold" />
          <Text variant="muted">ITM</Text>
        </Card>
      </View>

      <Stagger className="gap-3">
        <Card>
          <Text variant="heading">Staggered card 1</Text>
        </Card>
        <Card>
          <Text variant="heading">Staggered card 2</Text>
        </Card>
        <Card>
          <Text variant="heading">Staggered card 3</Text>
        </Card>
      </Stagger>

      <Pressable scale={0.96}>
        <Card highlighted>
          <Text variant="heading" className="text-pp-gold">
            Press me (spring)
          </Text>
        </Card>
      </Pressable>
    </Screen>
  );
}
