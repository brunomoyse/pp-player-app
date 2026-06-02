import { View } from 'react-native';

import { Badge, Button, Card, Screen, Text } from '@/components/ui';

export default function ShowcaseScreen() {
  return (
    <Screen contentClassName="gap-5">
      <Text variant="gold">PocketPair UI</Text>
      <Text variant="muted">Design-system showcase (Phase 1)</Text>

      {/* Typography */}
      <Card>
        <Text variant="label" className="mb-2">
          Typography
        </Text>
        <Text variant="title">Title — Space Grotesk</Text>
        <Text variant="heading">Heading — Space Grotesk</Text>
        <Text variant="body">Body — Inter regular, the quick brown fox.</Text>
        <Text variant="muted">Muted — Inter, secondary information.</Text>
        <Text variant="dim">Dim — least important caption.</Text>
        <Text variant="mono">Mono 1.234,56 € — JetBrains tabular</Text>
      </Card>

      {/* Buttons */}
      <Card>
        <Text variant="label" className="mb-3">
          Buttons
        </Text>
        <View className="gap-2">
          <Button title="Primary" variant="primary" />
          <Button title="Secondary" variant="secondary" />
          <Button title="Danger" variant="danger" />
          <Button title="Success" variant="success" />
          <Button title="Loading" variant="primary" loading />
          <Button title="Disabled" variant="primary" disabled />
        </View>
      </Card>

      {/* Badges */}
      <Card>
        <Text variant="label" className="mb-3">
          Badges
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label="Upcoming" tone="upcoming" />
          <Badge label="Live" tone="live" />
          <Badge label="Completed" tone="completed" />
          <Badge label="Deepstack" tone="deepstack" />
          <Badge label="Turbo" tone="turbo" />
          <Badge label="Freezeout" tone="freezeout" />
          <Badge label="Bounty" tone="bounty" />
          <Badge label="Gold" tone="gold" />
        </View>
      </Card>

      {/* Highlighted card */}
      <Card highlighted>
        <Text variant="heading" className="text-pp-gold">
          Highlighted card
        </Text>
        <Text variant="muted">Gold border + glow for featured / unlocked items.</Text>
      </Card>
    </Screen>
  );
}
