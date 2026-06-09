import { useToastStore } from '@/stores/useToastStore';

/**
 * Imperative toast helpers, callable from anywhere (event handlers, hooks,
 * Apollo callbacks). Rendering happens in ToastOverlay (root layout).
 */
export const toast = {
  success: (message: string) => useToastStore.getState().show('success', message),
  // Errors linger a bit longer so they can actually be read.
  error: (message: string) => useToastStore.getState().show('error', message, 5000),
  info: (message: string) => useToastStore.getState().show('info', message),
};
