/**
 * Provider-agnostic crash/error reporting seam.
 *
 * The app routes all non-fatal errors (ErrorBoundary render crashes, non-auth
 * GraphQL failures) through `captureException` / `captureMessage` here, so the
 * reporting backend can be swapped (or stay a no-op) without touching call
 * sites. Default behaviour is a no-op in production and a console log in dev.
 *
 * To enable Sentry (owner action — needs a DSN and a native rebuild):
 *   1. `npx expo install @sentry/react-native`
 *   2. add the `@sentry/react-native/expo` config plugin to `app.json`, then
 *      rebuild the dev/prod client (the native module is required).
 *   3. in `src/app/_layout.tsx`, before the app renders:
 *        import * as Sentry from '@sentry/react-native'
 *        Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN })
 *        setMonitoringBackend({
 *          captureException: (e) => Sentry.captureException(e),
 *          captureMessage: (m) => Sentry.captureMessage(m),
 *        })
 * No other wiring is needed — the seams below already feed it.
 */

export interface MonitoringBackend {
  captureException(error: unknown, context?: Record<string, unknown>): void;
  captureMessage(message: string, context?: Record<string, unknown>): void;
}

let backend: MonitoringBackend | null = null;

/** Register (or clear, with `null`) the reporting backend. */
export function setMonitoringBackend(next: MonitoringBackend | null): void {
  backend = next;
}

/** Whether a real reporting backend is wired up. */
export function isMonitoringEnabled(): boolean {
  return backend !== null;
}

/**
 * Surface a misconfiguration early: a DSN is set but no backend is registered,
 * which means errors are silently dropped in production. Call once at startup.
 */
export function initMonitoring(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (dsn && !backend && __DEV__) {
    console.warn(
      '[monitoring] EXPO_PUBLIC_SENTRY_DSN is set but no backend is registered. ' +
        'Install @sentry/react-native and call setMonitoringBackend() — see src/lib/monitoring.ts.'
    );
  }
}

/** Report a caught error. No-ops (dev: logs) when no backend is registered. */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (backend) {
    backend.captureException(error, context);
    return;
  }
  if (__DEV__) console.error('[monitoring] captureException', error, context ?? '');
}

/** Report a noteworthy message. No-ops (dev: logs) when no backend is registered. */
export function captureMessage(message: string, context?: Record<string, unknown>): void {
  if (backend) {
    backend.captureMessage(message, context);
    return;
  }
  if (__DEV__) console.warn('[monitoring] captureMessage', message, context ?? '');
}
