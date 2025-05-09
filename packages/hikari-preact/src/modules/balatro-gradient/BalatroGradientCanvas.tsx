/** @jsxImportSource preact */

import type { FunctionalComponent, JSX } from 'preact';
import { useRef, useLayoutEffect } from 'preact/hooks';
import { BalatroGradient, type BalatroGradientOptions } from '@dragonspark/hikari-effects';

export type BalatroGradientInitCallback = (gradient: BalatroGradient) => void;

export interface BalatroGradientProps extends Omit<BalatroGradientOptions, 'selector'> {
  /** CSS class for the canvas (use `class` in JSX) */
  class?: string;
  /** Inline styles */
  style?: JSX.CSSProperties;
  /** Called once the BalatroGradient instance is ready */
  onInit?: BalatroGradientInitCallback;
}

export const BalatroGradientCanvas: FunctionalComponent<BalatroGradientProps> = props => {
  const { onInit, class: className, style, ...options } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<BalatroGradient>();
  const idRef = useRef(`balatro-gradient-canvas-${Math.random().toString(36).slice(2, 9)}`);

  useLayoutEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    // Assign the stable ID
    canvasEl.id = idRef.current;

    // Initialize the gradient
    const gradient = new BalatroGradient({
      selector: `#${idRef.current}`,
      ...options
    });
    gradientRef.current = gradient;

    // Fire the callback
    onInit?.(gradient);

    // Cleanup on unmount
    return () => {
      gradient.pause();
      gradient.disconnect();
      gradientRef.current = undefined;
    };
  }, []); // run exactly once

  return (
    <canvas
      id={idRef.current}
      ref={canvasRef}
      class={className}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
};