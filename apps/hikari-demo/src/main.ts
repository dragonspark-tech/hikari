import './main.css';

import { MorphGradient } from '@dragonspark/hikari-effects';

// Initialize the gradient when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create a new gradient instance
  const gradient = new MorphGradient({
    // The selector for the canvas element
    selector: '#gradient-canvas'

    // Optional configuration
    // amplitude: 320,
    // seed: 5,
    // freqX: 14e-5,
    // freqY: 29e-5,
    // freqDelta: 1e-5
  });

  gradient.pause();
  gradient.play();

  // The gradient is automatically initialized when a selector is provided

  // You can also manually control the gradient
  // gradient.play();  // Start the animation
  // gradient.pause(); // Pause the animation

  // Toggle colors
  // gradient.toggleColor(0); // Toggle the base color
  // gradient.toggleColor(1); // Toggle the first wave layer

  // Update frequency
  // gradient.updateFrequency(1e-5); // Increase the frequency

  // Show/hide gradient legend
  // gradient.showGradientLegend();
  // gradient.hideGradientLegend();
});
