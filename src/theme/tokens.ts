// PocketPair design tokens (single source of truth for JS-side styling — e.g.
// navigation options, gradients, Reanimated — where NativeWind className can't
// reach). Mirrors tailwind.config.js + pp-mobile/assets/css/design-tokens.css.

export const colors = {
  bg: '#18181a',
  surface: '#1f1f22',
  surface2: '#26262a',
  border: '#2a2a2e',
  borderStrong: '#3a3a40',
  text: '#fafaf9',
  textMuted: '#a1a1aa',
  textDim: '#909096',
  gold: '#fee78a',
  goldStrong: '#fcd34d',
  goldDeep: '#b8860b',
  danger: '#ef4444',
  success: '#10b981',
} as const;

// Per-weight family names (RN maps custom fonts by family, not synthesized weight).
export const fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const radius = {
  md: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// Shared motion easing/spring — port of pp-mobile composables/useMotion.ts.
export const EASING = [0.16, 1, 0.3, 1] as const;
export const TIMING = { fast: 300, normal: 600, slow: 1000 } as const;
export const SPRING = { stiffness: 260, damping: 20, mass: 0.4 } as const;
