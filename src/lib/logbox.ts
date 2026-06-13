import { LogBox } from 'react-native';

// moti's barrel (imported by any `from 'moti'`) eagerly motifies the legacy
// react-native SafeAreaView, which calls `warnOnce` on load. moti's package
// `exports` map blocks deep-importing just MotiView, so the deprecated import
// is unavoidable until moti drops it upstream.
//
// LogBox.ignoreLogs only hides the in-app overlay — react-native's
// registerWarning still forwards every warning to the original console.warn,
// so the line keeps showing up in the DevTools console. Filter that one
// message at the source. Imported first in the root layout.
const SUPPRESSED = 'SafeAreaView has been deprecated';

LogBox.ignoreLogs([SUPPRESSED]);

const originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes(SUPPRESSED)) return;
  originalWarn(...args);
};
