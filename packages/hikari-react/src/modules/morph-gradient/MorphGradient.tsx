import { type CSSProperties, type ReactElement, useEffect, useRef, useState } from 'react';
import {
  MorphGradient as HikariMorphGradient,
  MorphGradientOptions
} from '@dragonspark/hikari-effects';

export type MorphGradientInitCallback = (gradient: HikariMorphGradient) => void;

export interface MorphGradientProps extends Omit<MorphGradientOptions, 'selector'> {
  className?: string;
  style?: CSSProperties;
  onInit?: MorphGradientInitCallback;
}

/**
 * Represents a component that renders a customizable morphing gradient on a `<canvas>` element.
 *
 * @param {MorphGradientProps} props - The properties passed to configure the gradient.
 * @property {string} [props.className] - Optional CSS class to apply to the `<canvas>` element.
 * @property {React.CSSProperties} [props.style] - Inline styles to apply to the `<canvas>` element.
 * @property {string} [props.baseColor] - The base color for the gradient. If not provided, defaults to '#a960ee'.
 * @property {string[]} [props.waveColors] - An array of wave colors for the gradient. At least one color is required. If not provided, defaults to ['#ff333d', '#90e0ff', '#ffcb57'].
 * @property {number} [props.amplitude] - The amplitude of the gradient's wave motion.
 * @property {number} [props.seed] - A seed value to generate a consistent random gradient pattern.
 * @property {number} [props.freqX] - Frequency of the wave pattern in the horizontal direction.
 * @property {number} [props.freqY] - Frequency of the wave pattern in the vertical direction.
 * @property {number} [props.freqDelta] - Change in the wave frequency over time.
 * @property {boolean} [props.darkenTop] - Specifies whether to apply a darker shade to the top of the gradient.
 * @property {Function} [props.onInit] - A callback function invoked once the gradient is initialized.
 *
 * @returns {ReactElement} A React component that renders the gradient animation inside a `<canvas>` element.
 *
 * @remarks
 * - The `HikariMorphGradient` instance is internally created and managed to control the gradient animation.
 * - The component automatically cleans up the gradient instance when it is unmounted to avoid memory leaks.
 * - The gradient requires at least two colors: a base color and at least one wave color.
 */
export const MorphGradient = ({
  className,
  style,
  baseColor,
  waveColors,
  amplitude,
  seed,
  freqX,
  freqY,
  freqDelta,
  darkenTop,
  onInit,
  wireframe,
  zoom,
  rotation,
  density
}: MorphGradientProps): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<HikariMorphGradient | null>(null);
  const [, setIsInitialized] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !gradientRef.current) {
      // Generate a unique ID for the canvas
      const canvasId = `gradient-canvas-${Math.random().toString(36).substring(2, 9)}`;
      canvasRef.current.id = canvasId;

      // Initialize the gradient
      const gradient = new HikariMorphGradient({
        selector: `#${canvasId}`,
        baseColor,
        waveColors,
        amplitude,
        seed,
        freqX,
        freqY,
        freqDelta,
        darkenTop,
        wireframe,
        zoom,
        rotation,
        density
      });

      // Store the gradient instance
      gradientRef.current = gradient;
      setIsInitialized(true);

      // Call the onInit callback if provided
      if (onInit) {
        onInit(gradient);
      }

      // Clean up when the component unmounts
      return () => {
        if (gradientRef.current) {
          gradientRef.current.pause();
          // The MorphGradient class has a disconnect method to clean up event listeners
          gradientRef.current.disconnect();
          gradientRef.current = null;
        }
      };
    }

    return () => {};
  }, [baseColor, waveColors, amplitude, seed, freqX, freqY, freqDelta, darkenTop, onInit, wireframe, zoom, rotation, density]);

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
