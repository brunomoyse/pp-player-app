import { Text as RNText, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

export type TextVariant =
  | 'title' // page title (display, bold)
  | 'heading' // section heading
  | 'gold' // gold display heading
  | 'body' // default body
  | 'muted' // secondary text
  | 'dim' // captions / least important
  | 'label' // mono uppercase eyebrow
  | 'mono' // tabular numeric / code
  | 'monoStrong';

const VARIANTS: Record<TextVariant, string> = {
  title: 'font-display-bold text-pp-text text-2xl',
  heading: 'font-display-bold text-pp-text text-lg',
  gold: 'font-display-bold text-pp-gold text-2xl',
  body: 'font-sans text-pp-text text-base',
  muted: 'font-sans text-pp-text-muted text-sm',
  dim: 'font-sans text-pp-text-dim text-xs',
  label: 'font-mono-medium text-pp-text-muted text-xs uppercase tracking-widest',
  mono: 'font-mono text-pp-text',
  monoStrong: 'font-mono-medium text-pp-text',
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  className?: string;
}

export function Text({ variant = 'body', className, ...rest }: AppTextProps) {
  return <RNText className={cn(VARIANTS[variant], className)} {...rest} />;
}
