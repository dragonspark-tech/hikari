# @dragonspark/hikari-react

> React components and hooks for the [@dragonspark/hikari](https://www.npmjs.com/package/@dragonspark/hikari) WebGL framework.

[![npm version](https://img.shields.io/npm/v/@dragonspark/hikari-react.svg?style=for-the-badge)](https://www.npmjs.com/package/@dragonspark/hikari-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## 🧩 Features

- React components for hikari effects
- Custom hooks for easy integration
- TypeScript support
- Responsive and performant animations

## ⚙️ Installation

```bash
npm install @dragonspark/hikari-react @dragonspark/hikari-effects @dragonspark/hikari
# or
yarn add @dragonspark/hikari-react @dragonspark/hikari-effects @dragonspark/hikari
```

Note: `@dragonspark/hikari` and `@dragonspark/hikari-effects` are peer dependencies and must be installed alongside this package.

## ✨ Available Components

### MorphGradient

A React component wrapper for the MorphGradient effect from hikari-effects.

#### Basic Usage

```jsx
import { MorphGradient } from '@dragonspark/hikari-react';

function App() {
  return (
    <div className="app">
      <MorphGradient 
        className="gradient-background"
        baseColor="#ff0000"
        waveColors={['#00ff00', '#0000ff', '#ffff00']}
      />
      <div className="content">
        <h1>Hello, World!</h1>
      </div>
    </div>
  );
}
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

```jsx
// The gradient will automatically use the CSS variables
<MorphGradient className="gradient-background" />
```

You can also pass CSS variables directly:

```jsx
<MorphGradient 
  className="gradient-background"
  baseColor="var(--gradient-color-1)"
  waveColors={[
    'var(--gradient-color-2)',
    'var(--gradient-color-3)',
    'var(--gradient-color-4)'
  ]}
/>
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

#### Props

- `className`: string (optional) - CSS class name for the canvas element
- `style`: React.CSSProperties (optional) - Inline styles for the canvas element
- `baseColor`: string (optional) - Base color for the gradient. Can be:
  - Hex color code (e.g., '#ff0000')
  - CSS variable name (e.g., '--gradient-color-1')
  - CSS variable reference (e.g., 'var(--gradient-color-1)')
  - If not provided, falls back to CSS variables or default base color ('#a960ee')
- `waveColors`: string[] (optional) - Array of wave colors for the gradient. Can be:
  - Hex color codes (e.g., '#ff0000')
  - CSS variable names (e.g., '--gradient-color-1')
  - CSS variable references (e.g., 'var(--gradient-color-1)')
  - At least one color is required
  - If not provided, falls back to CSS variables or default wave colors
- `amplitude`: number (optional) - Wave amplitude
- `seed`: number (optional) - Random seed
- `freqX`: number (optional) - X-axis frequency
- `freqY`: number (optional) - Y-axis frequency
- `freqDelta`: number (optional) - Frequency change rate
- `darkenTop`: boolean (optional) - Darken the top of the gradient
- `onInit`: (gradient: MorphGradient) => void (optional) - Callback when gradient is initialized

## 🪝 Custom Hooks

### useMorphGradient

A custom hook for using the MorphGradient effect in React components.

```jsx
import { useMorphGradient } from '@dragonspark/hikari-react';

function GradientComponent() {
  const canvasRef = useRef(null);

  const { gradient, isInitialized } = useMorphGradient({
    canvasRef,
    baseColor: '#3498db',
    waveColors: ['#9b59b6', '#e74c3c', '#f1c40f'],
    amplitude: 320
  });

  // You can control the gradient using the returned instance
  useEffect(() => {
    if (gradient) {
      // Pause the gradient after 5 seconds
      const timer = setTimeout(() => {
        gradient.pause();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gradient]);

  return (
    <div className="gradient-container">
      <canvas ref={canvasRef} className="gradient-canvas" />
    </div>
  );
}
```

## 📝 License

MIT © DragonSpark
