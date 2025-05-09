import { type CSSProperties, type ReactElement, useEffect, useRef } from 'react';
import {
  BalatroGradient,
  BalatroGradientOptions
} from '@dragonspark/hikari-effects';

export type BalatroGradientInitCallback = (gradient: BalatroGradient) => void;

export interface BalatroGradientProps extends Omit<BalatroGradientOptions, 'selector'> {
  className?: string;
  style?: CSSProperties;
  onInit?: BalatroGradientInitCallback;
}

/**
 * Represents a component that renders a customizable Balatro-style morphing gradient on a `<canvas>` element.
 *
 * @param {BalatroGradientProps} props - The properties passed to configure the gradient.
 * @property {string} [props.className] - Optional CSS class to apply to the `<canvas>` element.
 * @property {React.CSSProperties} [props.style] - Inline styles to apply to the `<canvas>` element.
 * @property {Function} [props.onInit] - A callback function invoked once the gradient is initialized.
 *
 * @returns {ReactElement} A React component that renders the gradient animation inside a `<canvas>` element.
 *
 * @remarks
 * - The gradient instance is internally created and managed to control the animation.
 * - The component automatically cleans up the gradient instance when it is unmounted to avoid memory leaks.
 */
export const BalatroGradientCanvas = ({
  className,
  style,
  onInit,
  ...options
}: BalatroGradientProps): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<BalatroGradient | null>(null);
  const idRef = useRef(`balatro-gradient-canvas-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    if (canvasRef.current && !gradientRef.current) {
      // Assign the stable ID
      canvasRef.current.id = idRef.current;

      // Initialize the gradient
      const gradient = new BalatroGradient({
        selector: `#${idRef.current}`,
        ...options
      });

      // Store the gradient instance
      gradientRef.current = gradient;

      // Call the onInit callback if provided
      if (onInit) {
        onInit(gradient);
      }

      // Clean up when the component unmounts
      return () => {
        if (gradientRef.current) {
          gradientRef.current.pause();
          gradientRef.current.disconnect();
          gradientRef.current = null;
        }
      };
    }

    return undefined;
  }, [onInit, options]); // Run once on mount

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        ...style
      }}
    />
  );
};