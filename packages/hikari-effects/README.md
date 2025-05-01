# @dragonspark/hikari-effects

> Ready-to-use visual effects built on top of the [@dragonspark/hikari](https://www.npmjs.com/package/@dragonspark/hikari) WebGL framework.

[![npm version](https://img.shields.io/npm/v/@dragonspark/hikari-effects.svg?style=for-the-badge)](https://www.npmjs.com/package/@dragonspark/hikari-effects)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## 🧩 Features

- Pre-built, customizable WebGL effects
- Seamless integration with hikari
- Responsive and performant animations
- Easy-to-use API

## ⚙️ Installation

```bash
npm install @dragonspark/hikari-effects @dragonspark/hikari
# or
yarn add @dragonspark/hikari-effects @dragonspark/hikari
```

Note: `@dragonspark/hikari` is a peer dependency and must be installed alongside this package.

## ✨ Available Effects

### MorphGradient

A beautiful, animated gradient background effect with morphing colors and shapes.

#### Basic Usage

```javascript
import { MorphGradient } from '@dragonspark/hikari-effects';

// Initialize the gradient on a canvas element
const gradient = new MorphGradient({
  selector: '#canvas',
  baseColor: '#ff0000',
  waveColors: ['#00ff00', '#0000ff', '#ffff00']
});
```

#### Using CSS Variables

You can define gradient colors using CSS variables:

```css
:root {
  --gradient-color-1: #ff0000;
  --gradient-color-2: #00ff00;
  --gradient-color-3: #0000ff;
  --gradient-color-4: #ffff00;
}
```

```javascript
// The gradient will automatically use the CSS variables
const gradient = new MorphGradientCanvas({
  selector: '#canvas'
});
```

You can also pass CSS variables directly:

```javascript
const gradient = new MorphGradientCanvas({
  selector: '#canvas',
  baseColor: 'var(--gradient-color-1)',
  waveColors: [
    'var(--gradient-color-2)',
    'var(--gradient-color-3)',
    'var(--gradient-color-4)'
  ]
});
```

If CSS variables are not available or parsing fails, the component will fall back to these default values:

```javascript
// Default base color
const defaultBaseColor = '#a960ee'; // Purple

// Default wave colors
const defaultWaveColors = [
  '#ff333d', // Red
  '#90e0ff', // Light blue
  '#ffcb57'  // Yellow
];
```

#### Customizing the Gradient

```javascript
const gradient = new MorphGradientCanvas({
  selector: '#canvas',
  amplitude: 320,       // Wave amplitude
  seed: 5,              // Random seed
  freqX: 14e-5,         // X-axis frequency
  freqY: 29e-5,         // Y-axis frequency
  freqDelta: 1e-5,      // Frequency change rate
  darkenTop: true       // Darken the top of the gradient
});
```

#### Controlling Animation

```javascript
// Pause animation
gradient.pause();

// Resume animation
gradient.play();

// Update frequency
gradient.updateFrequency(0.001);

// Toggle specific color
gradient.toggleColor(0); // Toggle first color
```

## 📖 API Reference

### MorphGradient

#### Constructor Options

```javascript
new MorphGradientCanvas(options)
```

- `options.selector`: string - CSS selector for the canvas element
- `options.baseColor`: string (optional) - Base color for the gradient. Can be:
  - Hex color code (e.g., '#ff0000')
  - CSS variable name (e.g., '--gradient-color-1')
  - CSS variable reference (e.g., 'var(--gradient-color-1)')
  - If not provided, falls back to CSS variables or default base color ('#a960ee')
- `options.waveColors`: string[] (optional) - Array of wave colors for the gradient. Can be:
  - Hex color codes (e.g., '#ff0000')
  - CSS variable names (e.g., '--gradient-color-1')
  - CSS variable references (e.g., 'var(--gradient-color-1)')
  - At least one color is required
  - If not provided, falls back to CSS variables or default wave colors
- `options.amplitude`: number (optional) - Wave amplitude
- `options.seed`: number (optional) - Random seed
- `options.freqX`: number (optional) - X-axis frequency
- `options.freqY`: number (optional) - Y-axis frequency
- `options.freqDelta`: number (optional) - Frequency change rate
- `options.darkenTop`: boolean (optional) - Darken the top of the gradient

#### Methods

- `play()`: Start/resume the animation
- `pause()`: Pause the animation
- `updateFrequency(delta)`: Update the frequency by the specified delta
- `toggleColor(index)`: Toggle the visibility of a color by index
- `resize()`: Resize the gradient to fit the container

## 💡 Examples

### Responsive Gradient Background

```javascript
import { MorphGradient } from '@dragonspark/hikari-effects';

// Create canvas element
const canvas = document.createElement('canvas');
canvas.id = 'gradient-bg';
document.body.appendChild(canvas);

// Initialize gradient
const gradient = new MorphGradient({
  selector: '#gradient-bg',
  baseColor: '#3498db',
  waveColors: ['#9b59b6', '#e74c3c', '#f1c40f']
});

// Handle window resize
window.addEventListener('resize', () => {
  gradient.resize();
});
```

### Interactive Gradient

```javascript
import { MorphGradient } from '@dragonspark/hikari-effects';

const gradient = new MorphGradient({
  selector: '#interactive-gradient'
});

// Toggle colors on click
document.querySelectorAll('.color-toggle').forEach((button, index) => {
  button.addEventListener('click', () => {
    gradient.toggleColor(index);
  });
});

// Pause/play on button click
document.querySelector('#play-pause').addEventListener('click', () => {
  if (gradient.conf.playing) {
    gradient.pause();
  } else {
    gradient.play();
  }
});
```

## 📝 License

MIT © DragonSpark
