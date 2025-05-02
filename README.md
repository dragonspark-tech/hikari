<p align="center">
    <a href="#">
        <img alt="Hikari" src="https://github.com/user-attachments/assets/f4f28187-e53e-4905-843f-1329ffe434db" width="100%" />
    </a>
</p>

<h1 align="center">
  Hikari Graphics Library
</h1>

<p align="center">
    <img alt="Static Badge" src="https://img.shields.io/badge/Mantained%20with-Nx%2020-blue?style=for-the-badge">
    <img alt="Static Badge" src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge">
</p>

> _**Hikari** is a lightweight WebGL framework for creating stunning visual 
> effects and rendering 3D/2D graphics in the browser._


## ✨ Overview

Hikari is a collection of JavaScript libraries designed to simplify WebGL development and provide ready-to-use visual effects. This monorepo contains the following packages:

| Package | Description | NPM |
|---------|-------------|-----|
| [@dragonspark/hikari](./packages/hikari) | Core WebGL framework for rendering 3D/2D graphics | [![npm version](https://img.shields.io/npm/v/@dragonspark/hikari.svg?style=for-the-badge)](https://www.npmjs.com/package/@dragonspark/hikari) |
| [@dragonspark/hikari-effects](./packages/hikari-effects) | Ready-to-use visual effects built on top of hikari | [![npm version](https://img.shields.io/npm/v/@dragonspark/hikari-effects.svg?style=for-the-badge)](https://www.npmjs.com/package/@dragonspark/hikari-effects) |
| [@dragonspark/hikari-react](./packages/hikari-react) | React components that implement the power of hikari-effects | [![npm version](https://img.shields.io/npm/v/@dragonspark/hikari-react.svg?style=for-the-badge)](https://www.npmjs.com/package/@dragonspark/hikari-react) |

## 🧩 Features

### @dragonspark/hikari

- Simple WebGL context management
- Streamlined rendering pipeline
- Built-in support for common geometries and materials
- Utility functions for camera projections and canvas sizing
- Lightweight and focused API

### @dragonspark/hikari-effects

- Pre-built, customizable WebGL effects
- Seamless integration with hikari
- Responsive and performant animations
- Easy-to-use API

## ⚙️ Installation

You can install individual packages based on your needs, using the package manager of your choice:

```bash
# Install core package
npm install @dragonspark/hikari

# Install effects package (requires hikari)
npm install @dragonspark/hikari-effects @dragonspark/hikari
```

## 🚩 Quick Start

### Basic Hikari Example

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

### Using Hikari Effects

```javascript
import { MorphGradient } from '@dragonspark/hikari-effects';

// Initialize the gradient on a canvas element
const gradient = new MorphGradient({
  selector: '#canvas',
  colors: ['#3498db', '#9b59b6', '#e74c3c', '#f1c40f']
});

// Handle window resize
window.addEventListener('resize', () => {
  gradient.resize();
});
```

## 📚 Documentation

For detailed documentation, please refer to the individual package READMEs:

- [@dragonspark/hikari Documentation](packages/hikari/README.md)
- [@dragonspark/hikari-effects Documentation](packages/hikari-effects/README.md)

## 🌐 Browser Support

- Chrome 49+
- Firefox 52+
- Safari 10+
- Edge 14+

## 🙌 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT license - see the [LICENSE](LICENSE.md) file for more details.
