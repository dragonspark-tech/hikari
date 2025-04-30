import { useEffect, useRef, useState } from 'react';
import { MorphGradient, MorphGradientOptions } from '@dragonspark/hikari-effects';

export interface UseMorphGradientOptions extends Omit<MorphGradientOptions, 'selector'> {
  canvasId: string;
  autoPlay?: boolean;
}

/**
 * A custom hook to set up and manage a MorphGradient instance for creating dynamic gradient effects.
 *
 * @param {Object} options - Configuration options for the MorphGradient.
 * @param {string} options.canvasId - The ID of the canvas element where the gradient will be rendered.
 * @param {string[]} options.colors - An array of color strings used in the gradient.
 * @param {number} options.amplitude - The amplitude controlling the intensity of gradient animation.
 * @param {number} options.seed - A numeric seed value to influence the gradient's randomization.
 * @param {number} options.freqX - The frequency value in the X direction for gradient movement.
 * @param {number} options.freqY - The frequency value in the Y direction for gradient movement.
 * @param {number} options.freqDelta - The rate of change in frequency over time.
 * @param {boolean} options.darkenTop - A flag indicating whether to add a darkened gradient effect at the top.
 * @param {boolean} [options.autoPlay=true] - A flag indicating whether the gradient animation should start automatically.
 * @return {Object} Controls and state of the MorphGradient instance.
 * @return {MorphGradient|null} return.gradient - The MorphGradient instance if initialized, or null otherwise.
 * @return {boolean} return.isInitialized - Indicates if the MorphGradient instance has been successfully initialized.
 * @return {Function} return.play - Starts or resumes the gradient animation.
 * @return {Function} return.pause - Pauses the gradient animation.
 * @return {Function} return.toggleColor - Toggles the visibility of a color in the gradient by its index.
 * @return {Function} return.updateFrequency - Updates the gradient's frequency by a given delta value.
 * @return {Function} return.showGradientLegend - Displays the legend for gradient colors.
 * @return {Function} return.hideGradientLegend - Hides the legend for gradient colors.
 */
export function useMorphGradient({
  canvasId,
  colors,
  amplitude,
  seed,
  freqX,
  freqY,
  freqDelta,
  darkenTop,
  autoPlay = true
}: UseMorphGradientOptions) {
  const gradientRef = useRef<MorphGradient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the gradient
    const gradient = new MorphGradient({
      selector: `#${canvasId}`,
      colors,
      amplitude,
      seed,
      freqX,
      freqY,
      freqDelta,
      darkenTop
    });

    // Store the gradient instance
    gradientRef.current = gradient;
    setIsInitialized(true);

    // Auto play if enabled
    if (!autoPlay) {
      gradient.pause();
    }

    // Clean up when the component unmounts
    return () => {
      if (gradientRef.current) {
        gradientRef.current.pause();
        gradientRef.current.disconnect();
        gradientRef.current = null;
      }
    };
  }, [canvasId, colors, amplitude, seed, freqX, freqY, freqDelta, darkenTop, autoPlay]);

  return {
    gradient: gradientRef.current,
    isInitialized,
    play: () => gradientRef.current?.play(),
    pause: () => gradientRef.current?.pause(),
    toggleColor: (index: number) => gradientRef.current?.toggleColor(index),
    updateFrequency: (delta: number) => gradientRef.current?.updateFrequency(delta),
    showGradientLegend: () => gradientRef.current?.showGradientLegend(),
    hideGradientLegend: () => gradientRef.current?.hideGradientLegend()
  };
}
