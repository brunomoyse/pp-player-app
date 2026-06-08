import { colors } from './tokens';

/**
 * Client-side rendering of cosmetic items. The backend stores an opaque
 * `previewRef` string per cosmetic (e.g. `avatar_frame/champion`); this maps the
 * ones we know how to render to concrete styling. An unmapped `previewRef`
 * returns `undefined` so the UI degrades gracefully to its default look —
 * future/unknown items never break the app.
 */

export interface FramePreview {
  /** Border colour applied as a ring around the avatar. */
  ringColor: string;
  /** Border width in px. */
  ringWidth: number;
}

/** avatar_frame previewRef → ring styling. */
const AVATAR_FRAMES: Record<string, FramePreview> = {
  'avatar_frame/champion': { ringColor: colors.goldStrong, ringWidth: 3 },
};

/** Resolve an equipped avatar_frame's previewRef to its ring styling. */
export function frameFor(previewRef?: string | null): FramePreview | undefined {
  return previewRef ? AVATAR_FRAMES[previewRef] : undefined;
}
