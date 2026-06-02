/** @type {import('tailwindcss').Config} */
// PocketPair design tokens — mirrors pp-mobile/assets/css/design-tokens.css
// (gold-on-charcoal). Class names match the web: bg-pp-bg, text-pp-gold, etc.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        pp: {
          bg: '#18181a',
          surface: '#1f1f22',
          'surface-2': '#26262a',
          border: '#2a2a2e',
          'border-strong': '#3a3a40',
          text: '#fafaf9',
          'text-muted': '#a1a1aa',
          'text-dim': '#909096',
          gold: '#fee78a',
          'gold-strong': '#fcd34d',
          'gold-deep': '#b8860b',
          danger: '#ef4444',
          success: '#10b981',
        },
      },
      fontFamily: {
        // Per-weight families — RN resolves custom fonts by family name, not by
        // synthesizing fontWeight. Use e.g. font-sans-semibold, font-display-bold.
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
        display: ['SpaceGrotesk_600SemiBold'],
        'display-bold': ['SpaceGrotesk_700Bold'],
        mono: ['JetBrainsMono_400Regular'],
        'mono-medium': ['JetBrainsMono_500Medium'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
