import { useSubscription } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { TOURNAMENT_REGISTRATIONS } from '@/graphql/operations';

/**
 * Live registered-player count: seeds from the query and adjusts on each
 * registration event pushed over the WebSocket.
 */
export function useLiveRegistrations(tournamentId: string | undefined, initialCount: number): number {
  const [count, setCount] = useState(initialCount);

  useEffect(() => setCount(initialCount), [initialCount]);

  const { data } = useSubscription(TOURNAMENT_REGISTRATIONS, {
    variables: { tournamentId: tournamentId! },
    skip: !tournamentId,
  });

  useEffect(() => {
    const evt = data?.tournamentRegistrations?.eventType;
    if (!evt) return;
    if (evt === 'REGISTERED') setCount((c) => c + 1);
    else if (evt === 'CANCELLED') setCount((c) => Math.max(0, c - 1));
  }, [data]);

  return count;
}
