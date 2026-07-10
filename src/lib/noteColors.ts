import type { NoteColor } from '@/types/notes';

/**
 * HUD-style color tags for player notes. Pure buckets: the author groups players
 * by color and keeps the meaning in their own head (blue = fish, etc.). Each has
 * a hex (tuned for the dark theme) and an i18n label key that is just the plain
 * color name, used only for screen-reader accessibility.
 */
export interface NoteColorSpec {
  value: NoteColor;
  hex: string;
  /** i18n key under notes.colors.* (plain color name, a11y only) */
  labelKey: string;
}

export const NOTE_COLORS: NoteColorSpec[] = [
  { value: 'RED', hex: '#ef4444', labelKey: 'notes.colors.red' },
  { value: 'ORANGE', hex: '#f97316', labelKey: 'notes.colors.orange' },
  { value: 'YELLOW', hex: '#eab308', labelKey: 'notes.colors.yellow' },
  { value: 'GREEN', hex: '#22c55e', labelKey: 'notes.colors.green' },
  { value: 'BLUE', hex: '#3b82f6', labelKey: 'notes.colors.blue' },
  { value: 'PURPLE', hex: '#a855f7', labelKey: 'notes.colors.purple' },
];

const HEX_BY_VALUE = Object.fromEntries(
  NOTE_COLORS.map((c) => [c.value, c.hex]),
) as Record<NoteColor, string>;

/** Hex for a note color, or null when the note has no color assigned. */
export function noteColorHex(color?: NoteColor | null): string | null {
  return color ? HEX_BY_VALUE[color] : null;
}
