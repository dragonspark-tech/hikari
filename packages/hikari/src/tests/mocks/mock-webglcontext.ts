import { vi } from 'vitest';

/**
 * The `mockWebGLContext` is an object designed to mock the WebGL rendering context for testing purposes.
 * It provides stubbed implementations of common WebGL methods and constants.
 * Most methods are mocked using `vi.fn()` to allow for spy operations and flexible behavior definition
 * in testing environments.
 */
export const mockWebGLContext = {
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clearDepth: vi.fn(),
  createBuffer: vi.fn(() => ({})),
  createProgram: vi.fn(() => ({})),
  createShader: vi.fn(() => ({})),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getProgramInfoLog: vi.fn(() => ''),
  getShaderParameter: vi.fn(() => true),
  getShaderInfoLog: vi.fn(() => ''),
  useProgram: vi.fn(),
  getUniformLocation: vi.fn(() => ({})),
  getAttribLocation: vi.fn(() => 0),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  drawElements: vi.fn(),
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
  STATIC_DRAW: 35044,
  FLOAT: 5126,
  UNSIGNED_SHORT: 5123,
  TRIANGLES: 4,
  LINES: 1,
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  LINK_STATUS: 35714,
  COMPILE_STATUS: 35713
};
