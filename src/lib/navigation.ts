import { router } from 'expo-router';

/**
 * Pop the stack, or land on the app root when there is nothing to pop.
 *
 * Screens reached by deep link — a push notification, a `pocketpair://` URL, or
 * an e2e flow — start with no history, and a bare `router.back()` there is a
 * silent no-op that logs "The action 'GO_BACK' was not handled by any
 * navigator". To the person tapping, the button is simply dead.
 */
export function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/(tabs)');
  }
}
