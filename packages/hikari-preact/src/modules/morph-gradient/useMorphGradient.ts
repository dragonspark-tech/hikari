import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { MorphGradient, type MorphGradientOptions } from '@dragonspark/hikari-effects';

export interface UseMorphGradientOptions extends Omit<MorphGradientOptions, 'selector'> {
  canvasId: string;
  autoPlay?: boolean;
}

/**
 * Initializes and manages a MorphGradient instance for a given canvas element.
 * Provides control over the MorphGradient's lifecycle and behavior, including playback, color toggling, and other properties.
 *
 * @param {Object} params - The parameters for initializing the MorphGradient.
 * @param {string} params.canvasId - The ID of the canvas element to bind the MorphGradient to.
 * @param {boolean} [params.autoPlay=true] - Whether the MorphGradient should start playing automatically.
 * @param {Object} [params.options] - Additional options to configure the MorphGradient behavior.
 * @return {Object} Returns an object with methods and properties to control and interact with the MorphGradient instance:
 * - gradient: The reference to the MorphGradient instance.
 * - isInitialized: A boolean indicating whether the gradient has been initialized.
 * - play: Function to resume the MorphGradient animation.
 * - pause: Function to pause the MorphGradient animation.
 * - toggleColor: Function to toggle a color at a specified index.
 * - updateFrequency: Function to set the gradient update frequency.
 * - setDensity: Function to adjust the gradient density.
 * - setRotation: Function to set the gradient rotation value.
 * - setZoom: Function to set the gradient zoom level.
 */
export function useMorphGradient({
  canvasId,
  autoPlay = true,
  ...options
}: UseMorphGradientOptions) {
  const gradientRef = useRef<MorphGradient>();
  const [isInitialized, setIsInitialized] = useState(false);

  useLayoutEffect(() => {
    const gradient = new MorphGradient({
      selector: `#${canvasId}`,
      ...options
    });
    gradientRef.current = gradient;
    setIsInitialized(true);

    if (!autoPlay) gradient.pause();

    return () => {
      gradient.pause();
      gradient.disconnect();
      gradientRef.current = undefined;
    };
  }, [canvasId]);

  useEffect(() => {
    if (!isInitialized) return;
    autoPlay ? gradientRef.current?.play() : gradientRef.current?.pause();
  }, [autoPlay, isInitialized]);

  return {
    gradient: gradientRef.current,
    isInitialized,
    play: () => gradientRef.current?.play(),
    pause: () => gradientRef.current?.pause(),
    toggleColor: (i: number) => gradientRef.current?.toggleColor(i),
    updateFrequency: (d: number) => gradientRef.current?.updateFrequency(d),
    setDensity: (d: [number, number]) => gradientRef.current?.setDensity(d),
    setRotation: (r: number) => gradientRef.current?.setRotation(r),
    setZoom: (z: number) => gradientRef.current?.setZoom(z)
  };
}
