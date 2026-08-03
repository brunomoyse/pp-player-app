import { LogBox } from 'react-native';

// Development-only warnings we can't fix at the call site, and that are noise
// rather than signal. The LogBox toast they raise sits on top of the tab bar
// and swallows taps meant for it — the tabs go dead while debugging on a
// device, and e2e flows fail on a tap that reports success.
//
// - moti's barrel (imported by any `from 'moti'`) eagerly motifies the legacy
//   react-native SafeAreaView, which calls `warnOnce` on load. moti's package
//   `exports` map blocks deep-importing just MotiView, so the deprecated import
//   is unavoidable until moti drops it upstream.
// - @sentry/react-native warns when `Sentry.wrap` runs before `Sentry.init`,
//   which is exactly what happens in dev, where there is no DSN to init with.
//   Sentry labels it development-only itself.
//
// LogBox.ignoreLogs only hides the in-app overlay — react-native's
// registerWarning still forwards every warning to the original console.warn,
// so the lines keep showing up in the DevTools console. Filter them at the
// source too. Imported first in the root layout.
const SUPPRESSED = ['SafeAreaView has been deprecated', 'App Start Span could not be finished'];

LogBox.ignoreLogs(SUPPRESSED);

const originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === 'string' && SUPPRESSED.some((message) => first.includes(message))) return;
  originalWarn(...args);
};
