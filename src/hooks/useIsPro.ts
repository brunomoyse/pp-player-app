import { useAuthStore } from '@/stores/useAuthStore';

/**
 * Whether the current user holds an active Pro entitlement. Driven by the `me`
 * query (refreshed on session restore). The backend `require_pro` guard is the
 * real gate — this only drives UX (upsell vs. dashboard).
 */
export function useIsPro(): boolean {
  return useAuthStore((s) => s.currentUser?.isPro ?? false);
}
