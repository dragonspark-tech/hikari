import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { BalatroGradient, type BalatroGradientOptions } from '@dragonspark/hikari-effects';

export interface UseBalatroGradientOptions extends Omit<BalatroGradientOptions, 'selector'> {
  canvasId: string;
  autoPlay?: boolean;
}

/**
 * Initializes and manages a BalatroGradient instance for a given canvas element.
 * Provides control over the BalatroGradient's lifecycle and behavior, including playback and property adjustments.
 *
 * @param {Object} params - The parameters for initializing the BalatroGradient.
 * @param {string} params.canvasId - The ID of the canvas element to bind the BalatroGradient to.
 * @param {boolean} [params.autoPlay=true] - Whether the BalatroGradient should start playing automatically.
 * @param {Object} [params.options] - Additional options to configure the BalatroGradient behavior.
 * @return {Object} Returns an object with methods and properties to control and interact with the BalatroGradient instance:
 * - gradient: The reference to the BalatroGradient instance.
 * - isInitialized: A boolean indicating whether the gradient has been initialized.
 * - play: Function to resume the BalatroGradient animation.
 * - pause: Function to pause the BalatroGradient animation.
 * - setSpinRotation: Function to set the spin rotation value.
 * - setSpinSpeed: Function to set the spin speed value.
 * - setOffset: Function to set the offset value.
 * - setColor1: Function to set the first color.
 * - setColor2: Function to set the second color.
 * - setColor3: Function to set the third color.
 * - setContrast: Function to set the contrast value.
 * - setLighting: Function to set the lighting value.
 * - setSpinAmount: Function to set the spin amount value.
 * - setPixelFilter: Function to set the pixel filter value.
 * - setSpinEase: Function to set the spin ease value.
 * - setIsRotate: Function to set the rotation mode.
 * - setMouseInteraction: Function to enable or disable mouse interaction.
 */
export function useBalatroGradient({
  canvasId,
  autoPlay = true,
  ...options
}: UseBalatroGradientOptions) {
  const gradientRef = useRef<BalatroGradient>();
  const [isInitialized, setIsInitialized] = useState(false);

  useLayoutEffect(() => {
    const gradient = new BalatroGradient({
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
    if (autoPlay) {
      gradientRef.current?.play();
    } else {
      gradientRef.current?.pause()
    }
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