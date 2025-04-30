# @dragonspark/hikari

> A lightweight WebGL framework for creating and rendering 3D/2D graphics in the browser.

[![npm version](https://img.shields.io/npm/v/@dragonspark/hikari.svg?style=for-the-badge)](https://www.npmjs.com/package/@dragonspark/hikari)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## 🧩 Features

- Simple WebGL context management
- Streamlined rendering pipeline
- Built-in support for common geometries and materials
- Utility functions for camera projections and canvas sizing
- Lightweight and focused API

## ⚙️ Installation

```bash
npm install @dragonspark/hikari
# or
yarn add @dragonspark/hikari
```

## 🛠️ Usage

### Basic Example

```javascript
import { HikariGL } from '@dragonspark/hikari';

// Create a new HikariGL instance
const hikari = new HikariGL({
  canvas: document.querySelector('#canvas'),
  width: window.innerWidth,
  height: window.innerHeight
});

// Set up orthographic camera
hikari.setOrthographicCamera();

// Create a plane geometry
const geometry = hikari.createPlaneGeometry(
  window.innerWidth,
  window.innerHeight
);

// Create a material with shaders
const material = hikari.createMaterial(
  // Vertex shader
  `
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment shader
  `
  precision mediump float;

  varying vec2 vUv;

  void main() {
    gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
  }
  `
);

// Create a mesh with the geometry and material
const mesh = hikari.createMesh(geometry, material);

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  hikari.render();
}
animate();
```

### Handling Resize Events

```javascript
window.addEventListener('resize', () => {
  hikari.setSize(window.innerWidth, window.innerHeight);
  hikari.setOrthographicCamera();
});
```

## 📖 API Reference

### HikariGL

The main class for managing WebGL context and rendering.

#### Constructor

```javascript
new HikariGL(options)
```

- `options.canvas`: HTMLCanvasElement - The canvas element to render to
- `options.width`: number (optional) - Initial canvas width
- `options.height`: number (optional) - Initial canvas height
- `options.debug`: boolean (optional) - Enable debug mode

#### Methods

- `setSize(width, height)`: Set the canvas size and update viewport
- `setOrthographicCamera(x, y, z, near, far)`: Set orthographic camera projection
- `render()`: Render the current frame
- `createAttribute(options)`: Create a new WebGL attribute
- `createUniform(options)`: Create a new WebGL uniform
- `createMaterial(vertexShaders, fragmentShaders, uniforms)`: Create a new material
- `createPlaneGeometry(width, height, xSegments, ySegments, orientation)`: Create a plane geometry
- `createMesh(geometry, material)`: Create a mesh from geometry and material

## 📦 Related Packages

- [@dragonspark/hikari-effects](https://www.npmjs.com/package/@dragonspark/hikari-effects) - Ready-to-use visual effects built on top of hikari

## 📝 License

MIT © DragonSpark
