import { colors } from '@/theme/tokens';

/**
 * Per-club identity band for tournament headers. The schema carries no club
 * logo or cover image, so the "cover photo" is generated instead: a club id
 * deterministically picks one ramp, giving every venue a stable look without an
 * asset pipeline.
 *
 * Ramps are hand-tuned rather than hue-rotated — a full colour wheel at this
 * lightness produces muddy greens and sickly yellows. All eight stay dark enough
 * for `pp-text` (#fafaf9) and `pp-gold` (#fee78a) to keep AA contrast on top.
 */
const RAMPS: readonly (readonly [string, string])[] = [
  ['#16261d', '#101914'], // felt green
  ['#2a1418', '#1a0f12'], // burgundy
  ['#131c2e', '#0f1420'], // navy
  ['#23162c', '#17101d'], // plum
  ['#10242a', '#0d181c'], // teal
  ['#2b2010', '#1c150b'], // whisky
  ['#1b1f26', '#13161b'], // slate
  ['#2c1a12', '#1d110c'], // copper
] as const;

/** djb2. Stable across runs — the same club must never change colour. */
function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Three gradient stops for a club's header band. The last stop is the page
 * background so the band dissolves into the screen instead of ending on a hard
 * edge. Falls back to the gold-adjacent whisky ramp when the club is unknown.
 */
export function clubGradient(clubId?: string | null): [string, string, string] {
  const ramp = clubId ? RAMPS[hash(clubId) % RAMPS.length] : RAMPS[5];
  return [ramp[0], ramp[1], colors.bg];
}
