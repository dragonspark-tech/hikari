/** @jsxImportSource preact */

import { useEffect, useRef, useState } from 'preact/hooks';
import { BalatroGradient, type BalatroGradientOptions } from '@dragonspark/hikari-effects';

export interface UseBalatroGradientOptions extends Omit<BalatroGradientOptions, 'selector'> {
  /**
   * The selector for the canvas element
   */
  selector: string;
  
  /**
   * Whether to automatically initialize the gradient
   * @default true
   */
  autoInit?: boolean;
}

/**
 * A hook for using the BalatroGradient in Preact components
 * 
 * @param options The options for the gradient
 * @returns An object containing the gradient instance and control functions
 */
export function useBalatroGradient(options: UseBalatroGradientOptions) {
  const { selector, autoInit = true, ...gradientOptions } = options;
  const [isInitialized, setIsInitialized] = useState(false);
  const gradientRef = useRef<BalatroGradient | undefined>(undefined);

  // Initialize the gradient
  useEffect(() => {
    if (!autoInit) return;

    const init = async () => {
      const gradient = new BalatroGradient({
        selector,
        ...gradientOptions
      });
      
      gradientRef.current = gradient;
      setIsInitialized(true);
    };

    init().catch(console.error);

    // Cleanup
    return () => {
      if (gradientRef.current) {
        gradientRef.current.pause();
        gradientRef.current.disconnect();
        gradientRef.current = undefined;
      }
    };
  }, [selector, autoInit, gradientOptions]);

  // Manual initialization function
  const initialize = async () => {
    if (gradientRef.current) return gradientRef.current;

    const gradient = new BalatroGradient({
      selector,
      ...gradientOptions
    });
    
    gradientRef.current = gradient;
    setIsInitialized(true);
    return gradient;
  };

  return {
    gradient: gradientRef.current,
    isInitialized,
    initialize,
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
    setMouseInteraction: (value: boolean) => gradientRef.current?.setMouseInteraction(value),
    setDensity: (value: [number, number]) => gradientRef.current?.setDensity(value)
  };
}