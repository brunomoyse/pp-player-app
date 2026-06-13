import { Text as RNText, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

export type TextVariant =
  | 'title' // page title (display, bold)
  | 'heading' // section heading
  | 'gold' // gold display heading
  | 'body' // default body
  | 'muted' // secondary text
  | 'caption' // small secondary text (13px) — use instead of arbitrary text-[13px]
  | 'dim' // captions / least important
  | 'micro' // smallest secondary text (11px) — use instead of arbitrary text-[11px]
  | 'label' // mono uppercase eyebrow
  | 'mono' // tabular numeric / code
  | 'monoStrong';

const VARIANTS: Record<TextVariant, string> = {
  title: 'font-display-bold text-pp-text text-2xl',
  heading: 'font-display-bold text-pp-text text-lg',
  gold: 'font-display-bold text-pp-gold text-2xl',
  body: 'font-sans text-pp-text text-base',
  muted: 'font-sans text-pp-text-muted text-sm',
  caption: 'font-sans text-pp-text-muted text-[13px]',
  dim: 'font-sans text-pp-text-dim text-xs',
  micro: 'font-sans text-pp-text-dim text-[11px]',
  label: 'font-mono-medium text-pp-text-muted text-xs uppercase tracking-widest',
  mono: 'font-mono text-pp-text',
  monoStrong: 'font-mono-medium text-pp-text',
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  className?: string;
}

// Every string in the app flows through this component (Button and Input wrap it
// too), so Dynamic Type support lives here. allowFontScaling honours the OS text
// size; the multiplier cap keeps dense tournament layouts intact at the largest
// accessibility sizes. Callers can override either prop when needed.
export function Text({
  variant = 'body',
  className,
  allowFontScaling = true,
  maxFontSizeMultiplier = 1.8,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn(VARIANTS[variant], className)}
      {...rest}
    />
  );
}
