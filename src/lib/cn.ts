import { twMerge } from 'tailwind-merge';

/** Merge class strings with Tailwind-aware conflict resolution (last wins),
 * since NativeWind does not dedupe conflicting utilities by string order. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return twMerge(parts.filter(Boolean).join(' '));
}
