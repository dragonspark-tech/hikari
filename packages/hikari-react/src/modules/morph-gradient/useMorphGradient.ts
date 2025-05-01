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
 * @param {string} options.baseColor - The base color of the gradient.
 * @param {string[]} options.waveColors - An array of colors used for the gradient waves.
 * @param {number} options.amplitude - The amplitude of the gradient waves.
 * @param {number} options.seed - The seed value for randomizing the gradient.
 * @param {number} options.freqX - The frequency of the gradient waves along the X-axis.
 * @param {number} options.freqY - The frequency of the gradient waves along the Y-axis.
 * @param {number} options.freqDelta - The change rate of frequency over time.
 * @param {boolean} options.darkenTop - Determines whether the top of the gradient is darkened.
 * @param {boolean} [options.autoPlay=true] - Whether the gradient animation should start playing automatically.
 * @param {number | [number, number]} options.density - The density of the gradient mesh or pattern.
 * @param {number} options.maxFrameTimeStep - The maximum time step between frame updates.
 * @param {number} options.rotation - The rotation of the gradient.
 * @param {boolean} options.wireframe - Indicates whether to display the gradient in wireframe mode.
 * @param {number} options.zoom - The zoom level of the gradient.
 */
export function useMorphGradient({
  canvasId,
  baseColor,
  waveColors,
  amplitude,
  seed,
  freqX,
  freqY,
  freqDelta,
  darkenTop,
  autoPlay = true,
  density,
  maxFrameTimeStep,
  rotation,
  wireframe,
  zoom
}: UseMorphGradientOptions) {
  const gradientRef = useRef<MorphGradient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the gradient
    const gradient = new MorphGradient({
      selector: `#${canvasId}`,
      baseColor,
      waveColors,
      amplitude,
      seed,
      freqX,
      freqY,
      freqDelta,
      darkenTop,
      density,
      maxFrameTimeStep,
      rotation,
      wireframe,
      zoom
    });

    // Store the gradient instance
    gradientRef.current = gradient;
    setIsInitialized(true);

    // Autoplay if enabled
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
  }, [canvasId, amplitude, seed, freqX, freqY, freqDelta, darkenTop, autoPlay, baseColor, waveColors, density, maxFrameTimeStep, rotation, wireframe, zoom]);

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
