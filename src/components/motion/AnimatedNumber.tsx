import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { EASING } from '@/lib/motion';
import { Text, type TextVariant } from '@/components/ui/Text';

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  variant?: TextVariant;
  className?: string;
}

function bezierY(t: number) {
  // Approximate the shared cubic-bezier ease-out for the count-up tween.
  const [, , , p3] = EASING;
  return 1 - Math.pow(1 - t, 1 + p3);
}

/** Count-up animation via requestAnimationFrame (port of motion-v AnimatedNumber). */
export function AnimatedNumber({
  value,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  format,
  variant = 'mono',
  className,
}: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const now0 = () => globalThis.performance?.now?.() ?? Date.now();
    const start = now0();
    const tick = () => {
      const now = now0();
      const t = Math.min((now - start) / duration, 1);
      setDisplay(from + (value - from) * bezierY(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, reduce]);

  const text = format ? format(display) : display.toFixed(decimals);
  return (
    <Text variant={variant} className={className}>
      {prefix}
      {text}
      {suffix}
    </Text>
  );
}
