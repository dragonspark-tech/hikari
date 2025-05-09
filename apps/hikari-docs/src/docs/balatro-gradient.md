# BalatroGradient

BalatroGradient is a WebGL-powered animated gradient component built on top of HikariGL. It renders a dynamic, spinning gradient effect inspired by the card game Balatro, with configurable colors, spin parameters, and visual effects.

---

## Table of Contents

- [Overview](#overview)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Public Methods](#public-methods)
- [Lifecycle & Events](#lifecycle--events)
- [React & Preact Integration](#react--preact-integration)
- [Internal Architecture](#internal-architecture)

---

## Overview

BalatroGradient creates a visually appealing animated gradient that spins and morphs over time. The gradient combines multiple colors with configurable contrast, lighting, and spin parameters. It supports mouse interaction for dynamic effects and can be customized with various parameters to achieve different visual styles.

---

## Usage

```typescript
import { BalatroGradient, BalatroGradientOptions } from '@dragonspark/hikari-effects';

// Define your options
const options: BalatroGradientOptions = {
  selector: '#my-gradient-canvas',
  spinRotation: -2.0,
  spinSpeed: 7.0,
  offset: [0.0, 0.0],
  color1: '#DE443B',
  color2: '#006BB4',
  color3: '#162325',
  contrast: 3.5,
  lighting: 0.4,
  spinAmount: 0.25,
  pixelFilter: 2000,
  spinEase: 1.0,
  isRotate: false,
  mouseInteraction: true,
  density: [0.01, 0.01],
  wireframe: false
};

// Instantiate and auto-initialize
const gradient = new BalatroGradient(options);
// Or manually init later:
// await gradient.initGradient('#my-gradient-canvas');
```

---

## Configuration Options

### BalatroGradientOptions

| Option               | Type               | Default                       | Description                                                                                         |
|----------------------|--------------------|-------------------------------|-----------------------------------------------------------------------------------------------------|
| **selector**         | `string`           | —                             | CSS selector for the `<canvas>` element.                                                           |
| **spinRotation**     | `number`           | `-2.0`                        | Base rotation value for the spin effect.                                                            |
| **spinSpeed**        | `number`           | `7.0`                         | Speed of the spinning animation.                                                                    |
| **offset**           | `[number, number]` | `[0.0, 0.0]`                  | X and Y offset for the gradient position.                                                           |
| **color1**           | `string`           | `'#DE443B'`                   | First color in the gradient (hex code).                                                             |
| **color2**           | `string`           | `'#006BB4'`                   | Second color in the gradient (hex code).                                                            |
| **color3**           | `string`           | `'#162325'`                   | Third color in the gradient (hex code).                                                             |
| **contrast**         | `number`           | `3.5`                         | Contrast level for the gradient colors.                                                             |
| **lighting**         | `number`           | `0.4`                         | Lighting effect intensity.                                                                          |
| **spinAmount**       | `number`           | `0.25`                        | Amount of spin effect applied.                                                                      |
| **pixelFilter**      | `number`           | `2000`                        | Pixel filtering effect intensity.                                                                   |
| **spinEase**         | `number`           | `1.0`                         | Easing factor for the spin animation.                                                               |
| **isRotate**         | `boolean`          | `false`                       | Whether to enable automatic rotation.                                                               |
| **mouseInteraction** | `boolean`          | `true`                        | Whether to enable mouse interaction with the gradient.                                              |
| **density**          | `[number, number]` | `[0.01, 0.01]`                | Mesh segment density as fractions of width/height.                                                  |
| **wireframe**        | `boolean`          | `false`                       | Renders mesh edges only.                                                                            |
| **maxFrameTimeStep** | `number`           | `60`                          | Maximum allowed delta time (ms) per frame.                                                          |
| **debug**            | `boolean`          | `false`                       | Enables debug logging.                                                                              |

---

## Public Methods

| Method                                      | Description                                                                                             |
|---------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `pause(): void`                             | Stops the animation loop (sets `playing = false`).                                                      |
| `play(): void`                              | Resumes or starts the animation loop via `requestAnimationFrame`.                                       |
| `setSpinRotation(value: number): void`      | Updates the spin rotation value.                                                                        |
| `setSpinSpeed(value: number): void`         | Updates the spin speed value.                                                                           |
| `setOffset(value: [number, number]): void`  | Updates the offset value.                                                                               |
| `setColor1(value: string): void`            | Updates the first color in the gradient.                                                                |
| `setColor2(value: string): void`            | Updates the second color in the gradient.                                                               |
| `setColor3(value: string): void`            | Updates the third color in the gradient.                                                                |
| `setContrast(value: number): void`          | Updates the contrast value.                                                                             |
| `setLighting(value: number): void`          | Updates the lighting value.                                                                             |
| `setSpinAmount(value: number): void`        | Updates the spin amount value.                                                                          |
| `setPixelFilter(value: number): void`       | Updates the pixel filter value.                                                                         |
| `setSpinEase(value: number): void`          | Updates the spin ease value.                                                                            |
| `setIsRotate(value: boolean): void`         | Enables or disables automatic rotation.                                                                 |
| `setMouseInteraction(value: boolean): void` | Enables or disables mouse interaction.                                                                  |
| `setDensity(value: [number, number]): void` | Updates mesh density and rebuilds topology accordingly.                                                 |

---

## Lifecycle & Events

1. **Construction**
    - Instantiates default configuration values.
    - Applies any provided `options` directly to properties.
    - If `options.selector` is present, calls `initGradient(selector)`.

2. **Initialization (`initGradient`)**
    - Queries the canvas via selector and, if found, invokes `connect()`.

3. **Connection (`connect`)**
    - Creates the HikariGL context.
    - Sets up scroll listener (`handleScroll`) to auto-pause/resume on scroll.
    - Sets up mouse move listener if `mouseInteraction` is enabled.
    - Marks the element as "loaded" with CSS classes after a delay.
    - Starts the animation via `play()`.

4. **Full Setup (`init`)**
    - Initializes the mesh and material.
    - Applies transformations.
    - Triggers initial `resize()` and begins the render loop.

5. **Animation Loop (`animate`)**
    - Skips frames if hidden or paused.
    - Computes time delta (clamped by `maxFrameTimeStep`).
    - Updates `u_time` uniform and other uniforms.
    - Renders with `hikari.render()`.
    - Requests next frame if still playing.

6. **Resizing (`resize`)**
    - On window resize, recalculates canvas size, mesh topology, and reapplies transformations.

7. **Cleanup (`disconnect`)**
    - Removes scroll/resize/mousemove listeners and stops playback.

---

## React & Preact Integration

BalatroGradient is available as a React component and a Preact component, making it easy to integrate into your React or Preact applications.

### React Usage

```tsx
import { BalatroGradientCanvas, useBalatroGradient } from '@dragonspark/hikari-react';

// Component-based approach
function MyComponent() {
  return (
    <BalatroGradientCanvas
      color1="#DE443B"
      color2="#006BB4"
      color3="#162325"
      spinRotation={-2.0}
      spinSpeed={7.0}
      contrast={3.5}
      lighting={0.4}
      mouseInteraction={true}
      onInit={(gradient) => {
        // Access the gradient instance if needed
        console.log('Gradient initialized:', gradient);
      }}
    />
  );
}

// Hook-based approach
function MyHookComponent() {
  const { gradient, play, pause, setColor1 } = useBalatroGradient({
    selector: '#my-gradient',
    color1: '#DE443B',
    color2: '#006BB4',
    color3: '#162325'
  });

  return (
    <>
      <canvas id="my-gradient" style={{ width: '100%', height: '100%' }} />
      <button onClick={() => setColor1('#FF0000')}>Change Color</button>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
    </>
  );
}
```

### Preact Usage

```tsx
/** @jsxImportSource preact */
import { BalatroGradientCanvas, useBalatroGradient } from '@dragonspark/hikari-preact';

// Component-based approach
function MyComponent() {
  return (
    <BalatroGradientCanvas
      color1="#DE443B"
      color2="#006BB4"
      color3="#162325"
      spinRotation={-2.0}
      spinSpeed={7.0}
      contrast={3.5}
      lighting={0.4}
      mouseInteraction={true}
      onInit={(gradient) => {
        // Access the gradient instance if needed
        console.log('Gradient initialized:', gradient);
      }}
    />
  );
}

// Hook-based approach
function MyHookComponent() {
  const { gradient, play, pause, setColor1 } = useBalatroGradient({
    selector: '#my-gradient',
    color1: '#DE443B',
    color2: '#006BB4',
    color3: '#162325'
  });

  return (
    <>
      <canvas id="my-gradient" style={{ width: '100%', height: '100%' }} />
      <button onClick={() => setColor1('#FF0000')}>Change Color</button>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
    </>
  );
}
```

---

## Internal Architecture

- **Shaders**
    - **Vertex Shader**: Handles basic vertex positioning.
    - **Fragment Shader**: Implements the gradient effect with spinning, color blending, and lighting.

- **Uniforms**
    - **Time & Animation**
        - `u_time`: Animation timestamp (seconds).
        - `u_spinRotation`: Base rotation value.
        - `u_spinSpeed`: Speed of the spinning animation.
        - `u_spinAmount`: Amount of spin effect.
        - `u_spinEase`: Easing factor for the spin.
        - `u_isRotate`: Whether automatic rotation is enabled.

    - **Colors & Visual Effects**
        - `u_color1`, `u_color2`, `u_color3`: RGB values for the three gradient colors.
        - `u_contrast`: Contrast level for the gradient.
        - `u_lighting`: Lighting effect intensity.
        - `u_pixelFilter`: Pixel filtering effect intensity.
        - `u_offset`: X and Y offset for the gradient position.
        - `u_mouse`: Mouse position for interaction effects.

- **Mesh & Rendering**
    - Uses a simple plane geometry with minimal segments (1x1) for efficiency.
    - Applies orthographic camera for consistent rendering.
    - Supports wireframe rendering for debugging.

---

With BalatroGradient, you can create visually stunning animated gradients that respond to user interaction and enhance the visual appeal of your application. The component is highly customizable, allowing you to achieve a wide range of visual effects by adjusting the various parameters.