# MorphGradient

MorphGradient is a WebGL-powered animated gradient component built on top of HikariGL. It renders a dynamic, morphing gradient effect by combining noise and blend shaders, with fully configurable wave layers, colors, and transformations.

---

## Table of Contents

- [Overview](#overview)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Public Methods](#public-methods)
- [Lifecycle & Events](#lifecycle--events)
- [Internal Architecture](#internal-architecture)

---

## Overview

Rather than a static background, MorphGradient continuously animates a multilayered gradient that “morphs” over time. Each layer is generated via noise-based vertex deformation and blended together in the fragment shader, producing rich, flowing color transitions. You can control colors, noise frequencies, amplitude, mesh density, zoom, rotation, and more via a simple options object.

---

## Usage

```typescript
import { MorphGradient, MorphGradientOptions } from '@dragonspark/hikari-effects';

// Define your options
const options: MorphGradientOptions = {
  selector: '#my-gradient-canvas',
  baseColor: '#00aaff',
  waveColors: ['#ff0066', '#00ff66', '#ffcc00'],
  amplitude: 400,
  seed: 10,
  freqX: 2e-4,
  freqY: 3e-4,
  freqDelta: 2e-5,
  darkenTop: false,
  wireframe: false,
  zoom: 1.2,
  rotation: 15,
  density: [0.08, 0.20],
  maxFrameTimeStep: 30
};

// Instantiate and auto‐initialize
const gradient = new MorphGradient(options);
// Or manually init later:
// await gradient.initGradient('#my-gradient-canvas');
```

---

## Configuration Options

### MorphGradientOptions

| Option               | Type               | Default                       | Description                                                                                         | Effect on Output                                                                                                                                                    |
|----------------------|--------------------|-------------------------------|-----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **selector**         | `string`           | —                             | CSS selector for the `<canvas>` element.                                                           | Targets the canvas where the gradient is rendered; required unless you call `initGradient()` separately.                                                             |
| **baseColor**        | `string`           | `'#a960ee'`                   | Base background color (hex code or CSS variable).                                                  | Sets the primary backdrop color behind all wave layers.                                                                                                             |
| **waveColors**       | `string[]`         | `['#ff333d', '#90e0ff', '#ffcb57']` | Array of colors for each noise-generated wave layer.                                               | Defines the color of each subsequent wave; blending them creates multi-tone gradients.                                                                               |
| **amplitude**        | `number`           | `320`                         | Vertical displacement amplitude for vertex deformation.                                             | Larger values make waves taller/more pronounced; smaller values flatten the ripples.                                                                                |
| **seed**             | `number`           | `5`                           | Initial seed for noise generation.                                                                 | Different seeds yield distinct noise patterns and wave “looks.”                                                                                                     |
| **freqX**            | `number`           | `1.4e-4`                      | Base noise frequency along the X axis.                                                             | Higher frequencies produce more, tighter waves horizontally; lower frequencies stretch them out.                                                                    |
| **freqY**            | `number`           | `2.9e-4`                      | Base noise frequency along the Y axis.                                                             | Controls vertical wave detail; increasing makes finer vertical ripples.                                                                                             |
| **freqDelta**        | `number`           | `1e-5`                        | Increment applied to both `freqX` and `freqY` each frame.                                           | Governs the morphing speed—larger deltas cause more rapid change in wave shapes over time.                                                                          |
| **darkenTop**        | `boolean`          | `true`                        | Toggles a dark overlay at the top of the gradient.                                                 | If `true`, applies a subtle darkening uniform (`u_darken_top`) in the fragment shader, giving depth at the top edge.                                                |
| **wireframe**        | `boolean`          | `false`                       | Renders mesh edges only.                                                                           | When enabled, the component draws just the mesh’s wireframe, revealing the underlying grid.                                                                         |
| **zoom**             | `number`           | `1`                           | Uniform zoom scale for the camera.                                                                 | Values > 1 zoom in; < 1 zoom out. Adjusts the orthographic projection matrix.                                                                                       |
| **rotation**         | `number`           | `0`                           | Rotation angle in degrees.                                                                         | Rotates the entire gradient view around its center.                                                                                                                 |
| **density**          | `[number, number]` | `[0.06, 0.16]`                | Mesh segment density as fractions of width/height.                                                 | Higher densities increase mesh resolution (more vertices → smoother deformation), at the cost of performance.                                                        |
| **maxFrameTimeStep** | `number`           | `60`                          | Maximum allowed delta time (ms) per frame.                                                         | Prevents large jumps in animation if a frame is delayed; lower values cap speed (smaller delta = slower perceived animation).                                       |

---

## Public Methods

| Method                               | Description                                                                                             |
|--------------------------------------|---------------------------------------------------------------------------------------------------------|
| `pause(): void`                      | Stops the animation loop (sets `playing = false`).                                                      |
| `play(): void`                       | Resumes or starts the animation loop via `requestAnimationFrame`.                                       |
| `setZoom(zoom: number): void`        | Updates `conf.zoom` and reapplies camera transformations.                                               |
| `setRotation(deg: number): void`     | Updates `conf.rotation` angle and reapplies camera transformations.                                      |
| `setDensity(d: [number, number]): void` | Updates mesh density (`conf.density`) and rebuilds topology accordingly.                                |
| `updateFrequency(delta: number): void` | Increments both `freqX` and `freqY` by `delta`, altering wave tightness over time.                      |
| `toggleColor(index: number): void`   | Enables/disables the wave layer at `index` by toggling its alpha (`u_active_colors[index]`).            |

---

## Lifecycle & Events

1. **Construction**
    - Instantiates default shader files, colors, and `conf` values.
    - Applies any provided `options` directly to properties.
    - If `options.selector` is present, calls `initGradient(selector)`.

2. **Initialization (`initGradient`)**
    - Queries the canvas via selector and, if found, invokes `connect()`.

3. **Connection (`connect`)**
    - Creates the HikariGL context.
    - Sets up scroll listener (`handleScroll`) to auto‐pause/resume on scroll.
    - Marks the element as “loaded” with CSS classes after a delay.
    - Starts the animation via `play()`.

4. **Full Setup (`init`)**
    - Parses and normalizes colors (`initGradientColors`).
    - Builds uniforms & material (`initMaterial`).
    - Creates geometry & mesh (`initMesh`).
    - Triggers initial `resize()` and begins the render loop.

5. **Animation Loop (`animate`)**
    - Skips frames if hidden or paused.
    - Computes time delta (clamped by `maxFrameTimeStep`).
    - Updates `u_time` uniform.
    - Renders with `hikari.render()`.
    - Requests next frame if still playing.

6. **Resizing (`resize`)**
    - On window resize, recalculates canvas size, mesh topology, and reapplies zoom/rotation.

7. **Cleanup (`disconnect`)**
    - Removes scroll/resize listeners and stops playback.

---

## Internal Architecture

- **Shaders**
    - **Noise Shader** (`noiseShader`): Generates Perlin‐like noise for vertex deformation.
    - **Blend Shader** (`blendShader`): Blends multiple noise layers into a smooth gradient.
    - **Vertex Shader** (`vertexShader`): Applies vertex deformation based on noise and incline.
    - **Fragment Shader** (`fragmentShader`): Colors fragments, applies `u_baseColor`, wave layers, and optional darkening.

- **Uniforms**
    - **Time & Shadow**
        - `u_time`: Animation timestamp (ms).
        - `u_shadow_power`: Controls drop-shadow intensity (adaptive based on width).

    - **Color & Layers**
        - `u_baseColor` (vec3): RGB of the base layer.
        - `u_waveLayers` (array of structs): Each with `color`, `noiseFreq`, `noiseSpeed`, `noiseFlow`, `noiseSeed`, `noiseFloor`, `noiseCeil`.
        - `u_active_colors` (vec4): Toggles visibility per layer.

    - **Global Noise**
        - `u_global.noiseFreq` (vec2): Combined X/Y noise frequencies.
        - `u_global.noiseSpeed`: Base speed for noise evolution.

    - **Vertex Deformation**
        - Struct `u_vertDeform` (excluded from fragment):
            - `incline`: Slope of the plane.
            - `offsetTop`/`offsetBottom`: Vertical offsets.
            - `noiseFreq`/`noiseAmp`/`noiseSpeed`/`noiseFlow`/`noiseSeed`: Controls deformation.

- **Mesh & Camera**
    - Uses an **orthographic** camera.
    - The plane geometry is subdivided according to `density`.
    - Zoom and rotation applied directly to the projection matrix.

---

With these building blocks, **MorphGradient** offers an expressive, high-performance background effect that can be tailored to any brand’s color palette, animation speed, and visual style. Feel free to tweak noise parameters, add more wave colors, or drive it dynamically in response to user input!