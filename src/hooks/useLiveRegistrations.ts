import { useSubscription } from '@apollo/client/react';
import { useState } from 'react';

import { TOURNAMENT_REGISTRATIONS } from '@/graphql/operations';

/**
 * Live registered-player count: seeds from the query and adjusts on each
 * registration event pushed over the WebSocket. The delta is applied in the
 * subscription's onData callback (not a sync effect), and reset via the
 * adjust-state-on-prop-change pattern when the query seed changes.
 */
export function useLiveRegistrations(tournamentId: string | undefined, initialCount: number): number {
  const [seed, setSeed] = useState(initialCount);
  const [delta, setDelta] = useState(0);

  // Reset the running delta whenever the query's base count changes.
  if (seed !== initialCount) {
    setSeed(initialCount);
    setDelta(0);
  }

  useSubscription(TOURNAMENT_REGISTRATIONS, {
    variables: { tournamentId: tournamentId! },
    skip: !tournamentId,
    onData: ({ data }) => {
      const evt = data.data?.tournamentRegistrations?.eventType;
      if (evt === 'REGISTERED') setDelta((d) => d + 1);
      else if (evt === 'CANCELLED') setDelta((d) => d - 1);
    },
  });

  return Math.max(0, initialCount + delta);
}
