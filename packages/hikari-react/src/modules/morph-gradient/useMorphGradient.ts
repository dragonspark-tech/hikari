import { useEffect, useRef, useState } from 'react';
import { MorphGradient, MorphGradientOptions } from '@dragonspark/hikari-effects';

export interface UseMorphGradientOptions extends Omit<MorphGradientOptions, 'selector'> {
  canvasId: string;
  autoPlay?: boolean;
}

/**
 * Initializes and manages a morphing gradient visualization on a specified canvas.
 * Provides methods to control playback, update properties, and toggle features of the gradient animation.
 *
 * @param {Object} options - The options for configuring the morph gradient.
 * @param {string} options.canvasId - The ID of the canvas element where the gradient will be rendered.
 * @param {boolean} [options.autoPlay=true] - Whether the gradient animation should start playing automatically.
 * @return {Object} Returns an object with methods and properties to control and interact with the MorphGradient instance.
 */
export function useMorphGradient({
  canvasId,
  autoPlay = true,
  ...options
}: UseMorphGradientOptions) {
  const gradientRef = useRef<MorphGradient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the gradient
  useEffect(() => {
    const gradient = new MorphGradient({
      selector: `#${canvasId}`,
      ...options
    });

    // Store the gradient instance
    gradientRef.current = gradient;
    setIsInitialized(true);

    // Clean up when the component unmounts
    return () => {
      if (gradientRef.current) {
        gradientRef.current.pause();
        gradientRef.current.disconnect();
        gradientRef.current = null;
      }
    };
  }, [canvasId, options]);

  useEffect(() => {
    if (!isInitialized) return;
    autoPlay ? gradientRef.current?.play() : gradientRef.current?.pause();
  }, [autoPlay, isInitialized]);

  return {
    gradient: gradientRef.current,
    isInitialized,
    play: () => gradientRef.current?.play(),
    pause: () => gradientRef.current?.pause(),
    toggleColor: (index: number) => gradientRef.current?.toggleColor(index),
    updateFrequency: (delta: number) => gradientRef.current?.updateFrequency(delta),
    setDensity: (density: [number, number]) => gradientRef.current?.setDensity(density),
    setRotation: (rotation: number) => gradientRef.current?.setRotation(rotation),
    setZoom: (zoom: number) => gradientRef.current?.setZoom(zoom)
  };
}
