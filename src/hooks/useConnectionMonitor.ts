import { useEffect } from 'react';
import { AppState } from 'react-native';

import { apolloClient, wsClient } from '@/graphql/client';
import { useConnectionStore } from '@/stores/useConnectionStore';

/** Close codes that mean "we hung up on purpose", not a dropped connection:
 * 1000 = lazy mode closing an idle socket, 4499 = our own terminate(). */
const INTENTIONAL_CLOSE_CODES = new Set([1000, 4499]);

/**
 * Watches the subscription socket and the app lifecycle so live screens never
 * show stale data as live. Mounted once in the root layout.
 */
export function useConnectionMonitor() {
  const setWsDown = useConnectionStore((s) => s.setWsDown);

  // Socket health → connection store (drives the ConnectionBanner).
  useEffect(() => {
    const disposers = [
      wsClient.on('connected', () => setWsDown(false)),
      wsClient.on('closed', (event) => {
        const code = (event as { code?: number } | undefined)?.code;
        if (code !== undefined && !INTENTIONAL_CLOSE_CODES.has(code)) setWsDown(true);
      }),
      wsClient.on('error', () => setWsDown(true)),
    ];
    return () => disposers.forEach((dispose) => dispose());
  }, [setWsDown]);

  // On return to foreground: refresh queries that went stale in the background
  // and kick a dead socket so the retry loop reconnects immediately.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void apolloClient.reFetchObservableQueries().catch(() => {});
      if (useConnectionStore.getState().wsDown) wsClient.terminate();
    });
    return () => sub.remove();
  }, []);
}
