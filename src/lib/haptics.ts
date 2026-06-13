import * as Haptics from 'expo-haptics';

// Thin, fire-and-forget wrappers around expo-haptics. expo-haptics is already a
// no-op on web and silently ignores unsupported devices, so no platform guard is
// needed — these just keep call sites terse and intent-named.
//
// NOTE: success/error confirmations that surface a toast already vibrate via
// ToastOverlay (it fires Success/Error haptics on every toast). Use `tap()` for
// press/selection feedback on controls that do NOT produce a toast — avoid pairing
// success()/error() with a toast.* call or the device will buzz twice.

/** Light selection/press feedback — buttons, segment changes, steppers. */
export function tap() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Medium impact — confirming a meaningful, non-toast action. */
export function impact() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Success notification — only for flows that do NOT also show a success toast. */
export function success() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Warning notification — e.g. opening a destructive confirmation. */
export function warning() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}
