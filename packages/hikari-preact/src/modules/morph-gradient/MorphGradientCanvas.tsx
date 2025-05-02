/** @jsxImportSource preact */

import type { FunctionalComponent, JSX } from 'preact';
import { useRef, useLayoutEffect } from 'preact/hooks';
import { MorphGradient, type MorphGradientOptions } from '@dragonspark/hikari-effects';

export type MorphGradientInitCallback = (gradient: MorphGradient) => void;

export interface MorphGradientProps extends Omit<MorphGradientOptions, 'selector'> {
  /** CSS class for the canvas (use `class` in JSX) */
  class?: string;
  /** Inline styles */
  style?: JSX.CSSProperties;
  /** Called once the MorphGradient instance is ready */
  onInit?: MorphGradientInitCallback;
}

export const MorphGradientCanvas: FunctionalComponent<MorphGradientProps> = props => {
  // Separate out onInit so it isn’t buried in “options” below
  const { onInit, class: className, style, ...options } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<MorphGradient>();
  // Generate a stable ID exactly once
  const idRef = useRef(`gradient-canvas-${Math.random().toString(36).slice(2, 9)}`);

  useLayoutEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    // Assign the stable ID
    canvasEl.id = idRef.current;

    // Initialize the gradient
    const gradient = new MorphGradient({
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