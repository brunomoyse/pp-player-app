import { describe, expect, it } from '@jest/globals';

import { clubGradient } from '@/lib/clubGradient';
import { colors } from '@/theme/tokens';

describe('clubGradient', () => {
  it('is stable for the same club', () => {
    expect(clubGradient('club-a')).toEqual(clubGradient('club-a'));
  });

  it('always ends on the page background so the band dissolves', () => {
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']) {
      expect(clubGradient(id)[2]).toBe(colors.bg);
    }
  });

  it('returns a ramp for an unknown club', () => {
    expect(clubGradient(null)).toHaveLength(3);
    expect(clubGradient(undefined)[0]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('spreads real-world ids across more than one ramp', () => {
    const ids = Array.from({ length: 40 }, (_, i) => `550e8400-e29b-41d4-a716-4466554400${i}`);
    const distinct = new Set(ids.map((id) => clubGradient(id)[0]));
    expect(distinct.size).toBeGreaterThan(3);
  });
});
