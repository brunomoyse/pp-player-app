import { Link, Stack } from 'expo-router';

import { Screen, Text } from '@/components/ui';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen scroll={false} contentClassName="items-center justify-center gap-3">
        <Text variant="title">404</Text>
        <Text variant="muted">This screen does not exist.</Text>
        <Link href="/" className="mt-2">
          <Text className="text-pp-gold font-sans-semibold">Go home</Text>
        </Link>
      </Screen>
    </>
  );
}
