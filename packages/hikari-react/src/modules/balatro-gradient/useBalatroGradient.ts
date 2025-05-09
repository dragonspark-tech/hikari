import { useEffect, useRef, useState } from 'react';
import { BalatroGradient, BalatroGradientOptions } from '@dragonspark/hikari-effects';

export interface UseBalatroGradientOptions extends Omit<BalatroGradientOptions, 'selector'> {
  canvasId: string;
  autoPlay?: boolean;
}

/**
 * Initializes and manages a Balatro-style morphing gradient visualization on a specified canvas.
 * Provides methods to control playback, update properties, and toggle features of the gradient animation.
 *
 * @param {Object} options - The options for configuring the Balatro gradient.
 * @param {string} options.canvasId - The ID of the canvas element where the gradient will be rendered.
 * @param {boolean} [options.autoPlay=true] - Whether the gradient animation should start playing automatically.
 * @return {Object} Returns an object with methods and properties to control and interact with the BalatroGradient instance.
 */
export function useBalatroGradient({
  canvasId,
  autoPlay = true,
  ...options
}: UseBalatroGradientOptions) {
  const gradientRef = useRef<BalatroGradient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the gradient
  useEffect(() => {
    const gradient = new BalatroGradient({
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
    setSpinRotation: (value: number) => gradientRef.current?.setSpinRotation(value),
    setSpinSpeed: (value: number) => gradientRef.current?.setSpinSpeed(value),
    setOffset: (value: [number, number]) => gradientRef.current?.setOffset(value),
    setColor1: (value: string) => gradientRef.current?.setColor1(value),
    setColor2: (value: string) => gradientRef.current?.setColor2(value),
    setColor3: (value: string) => gradientRef.current?.setColor3(value),
    setContrast: (value: number) => gradientRef.current?.setContrast(value),
    setLighting: (value: number) => gradientRef.current?.setLighting(value),
    setSpinAmount: (value: number) => gradientRef.current?.setSpinAmount(value),
    setPixelFilter: (value: number) => gradientRef.current?.setPixelFilter(value),
    setSpinEase: (value: number) => gradientRef.current?.setSpinEase(value),
    setIsRotate: (value: boolean) => gradientRef.current?.setIsRotate(value),
    setMouseInteraction: (value: boolean) => gradientRef.current?.setMouseInteraction(value)
  };
}