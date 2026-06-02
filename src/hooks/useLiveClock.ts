import { useSubscription } from '@apollo/client/react';
import { useEffect, useRef, useState } from 'react';

import type { ClockLevel } from '@/components';
import { TOURNAMENT_CLOCK_UPDATES } from '@/graphql/operations';
import type { TournamentClock } from '@/types/clock';
import type { TournamentStructure } from '@/types/tournament';

function toLevel(s?: TournamentStructure | null): ClockLevel | null {
  if (!s) return null;
  return {
    level: s.levelNumber,
    smallBlind: s.smallBlind,
    bigBlind: s.bigBlind,
    ante: s.ante ?? null,
    isBreak: s.isBreak,
  };
}

export interface LiveClock {
  currentLevel: ClockLevel | null;
  nextLevel: ClockLevel | null;
  timeRemaining: number;
  isLive: boolean;
}

/**
 * Live tournament clock: seeds from the query's clock, then keeps it current via
 * the WebSocket subscription plus a local 1s countdown while RUNNING (so the
 * timer ticks smoothly between server pushes).
 */
export function useLiveClock(
  tournamentId: string | undefined,
  initial: TournamentClock | null | undefined
): LiveClock {
  const [clock, setClock] = useState<TournamentClock | null>(initial ?? null);
  const [remaining, setRemaining] = useState<number>(initial?.timeRemainingSeconds ?? 0);

  // Re-seed when the underlying query clock changes (adjust-state-on-prop-change).
  const [seed, setSeed] = useState(initial ?? null);
  if (seed !== initial) {
    setSeed(initial ?? null);
    if (initial) {
      setClock(initial);
      setRemaining(initial.timeRemainingSeconds ?? 0);
    }
  }

  // Apply each server push in the subscription callback (not a sync effect).
  useSubscription(TOURNAMENT_CLOCK_UPDATES, {
    variables: { tournamentId: tournamentId! },
    skip: !tournamentId,
    onData: ({ data }) => {
      const next = data.data?.tournamentClockUpdates;
      if (next) {
        setClock(next);
        setRemaining(next.timeRemainingSeconds ?? 0);
      }
    },
  });

  // Local countdown while running.
  const running = clock?.status === 'RUNNING';
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return {
    currentLevel: toLevel(clock?.currentStructure),
    nextLevel: toLevel(clock?.nextStructure),
    timeRemaining: remaining,
    isLive: running,
  };
}
