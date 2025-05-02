import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttributeOptions, HikariGL, UniformOptions } from '../';
import { Attribute, Material, PlaneGeometry, Uniform } from '../core';

const mockWebGLContext = {
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
  lineWidth: vi.fn(),
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

// Mock document and canvas
global.document = {
  createElement: vi.fn(() => ({
    getContext: vi.fn(() => mockWebGLContext),
    width: 0,
    height: 0
  })),
  location: {
    search: ''
  }
} as any;

describe('HikariGL', () => {
  let canvas: HTMLCanvasElement;
  let hikari: HikariGL;

  beforeEach(() => {
    // Create a canvas element
    canvas = document.createElement('canvas');

    // Mock getContext to return our mock WebGL context
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockWebGLContext as unknown as WebGL2RenderingContext);

    // Create a HikariGL instance
    hikari = new HikariGL({ canvas });
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(hikari.canvas).toBe(canvas);
      expect(hikari.gl).toBeDefined();
      expect(hikari.meshes).toEqual([]);
      expect(hikari.commonUniforms).toBeDefined();
      expect(hikari.debug).toBeInstanceOf(Function);
    });

    it('should set size if width and height are provided', () => {
      // Create a mock implementation that doesn't call the method
      const setSize = vi.spyOn(HikariGL.prototype, 'setSize').mockImplementation(() => void 0);
      new HikariGL({ canvas, width: 800, height: 600 });
      expect(setSize).toHaveBeenCalledWith(800, 600);

      // Restore the original implementation
      setSize.mockRestore();
    });

    it('should set up debug function if debug is true', () => {
      // Mock document.location.search to include debug=webgl
      Object.defineProperty(document, 'location', {
        value: {
          search: '?debug=webgl'
        },
        writable: true
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => void 0);
      const hikariDebug = new HikariGL({ canvas, debug: true });

      hikariDebug.debug('Test message');
      expect(consoleSpy).toHaveBeenCalled();

      // Reset console.log mock
      consoleSpy.mockRestore();
    });

    it('should log separator when time between debug messages is greater than 1000ms', () => {
      // Mock document.location.search to include debug=webgl
      Object.defineProperty(document, 'location', {
        value: {
          search: '?debug=webgl'
        },
        writable: true
      });

      // Mock Date to control time
      const originalDate = global.Date;
      const mockDate = vi.fn(() => new originalDate('2023-01-01T12:00:00Z'));
      global.Date = mockDate as any;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => void 0);
      const hikariDebug = new HikariGL({ canvas, debug: true });

      // First debug message
      hikariDebug.debug('First message');
      expect(consoleSpy).toHaveBeenCalled();

      // Change the mock date to be 1001 ms later
      mockDate.mockImplementation(() => new originalDate('2023-01-01T12:00:01.001Z'));

      // Second debug message (should trigger separator)
      hikariDebug.debug('Second message');

      // Verify separator was logged
      expect(consoleSpy).toHaveBeenCalledWith('---');

      // Restore mocks
      consoleSpy.mockRestore();
      global.Date = originalDate;
    });
  });

  describe('setSize', () => {
    it('should set width and height', () => {
      hikari.setSize(800, 600);
      expect(hikari.width).toBe(800);
      expect(hikari.height).toBe(600);
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
      expect(mockWebGLContext.viewport).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('should use default values if not provided', () => {
      hikari.setSize();
      expect(hikari.width).toBe(640);
      expect(hikari.height).toBe(480);
    });

    it('should update uniforms', () => {
      hikari.setSize(800, 600);
      expect(hikari.commonUniforms.resolution.value).toEqual([800, 600]);
      expect(hikari.commonUniforms.aspectRatio.value).toBe(800 / 600);
    });
  });

  describe('setOrthographicCamera', () => {
    it('should set projection matrix', () => {
      hikari.width = 800;
      hikari.height = 600;
      hikari.setOrthographicCamera();

      const projectionMatrix = hikari.commonUniforms.projectionMatrix as Uniform<'mat4'>;
      expect(projectionMatrix.value).toBeDefined();
      expect(projectionMatrix.value.length).toBe(16);
    });

    it('should use default values if not provided', () => {
      hikari.width = 800;
      hikari.height = 600;
      hikari.setOrthographicCamera();
      const projectionMatrix = hikari.commonUniforms.projectionMatrix as Uniform<'mat4'>;
      expect(projectionMatrix.value[12]).toBe(0); // x
      expect(projectionMatrix.value[13]).toBe(0); // y
      expect(projectionMatrix.value[14]).toBe(0); // z
    });

    it('should use provided values', () => {
      hikari.width = 800;
      hikari.height = 600;
      hikari.setOrthographicCamera(10, 20, 30, -1000, 1000);
      const projectionMatrix = hikari.commonUniforms.projectionMatrix as Uniform<'mat4'>;
      expect(projectionMatrix.value[12]).toBe(10); // x
      expect(projectionMatrix.value[13]).toBe(20); // y
      expect(projectionMatrix.value[14]).toBe(30); // z
    });
  });

  describe('render', () => {
    it('should clear the canvas and draw all meshes', () => {
      const mesh = { draw: vi.fn() };
      hikari.meshes = [mesh as any];
      hikari.render();
      expect(mockWebGLContext.clearColor).toHaveBeenCalledWith(0, 0, 0, 0);
      expect(mockWebGLContext.clearDepth).toHaveBeenCalledWith(1);
      expect(mesh.draw).toHaveBeenCalled();
    });
  });

  describe('createAttribute', () => {
    it('should create and return an Attribute instance', () => {
      const options: AttributeOptions = { target: 1, size: 3 };
      const attribute = hikari.createAttribute(options);
      expect(attribute).toBeInstanceOf(Attribute);
    });
  });

  describe('createUniform', () => {
    it('should create and return a Uniform instance', () => {
      const options: UniformOptions = { type: 'float', value: 1.0 };
      const uniform = hikari.createUniform(options);
      expect(uniform).toBeInstanceOf(Uniform);
      expect(uniform.type).toBe('float');
      expect(uniform.value).toBe(1.0);
    });
  });

  describe('createMaterial', () => {
    it('should create and return a Material instance', () => {
      const vertexShader = 'void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }';
      const fragmentShader = 'void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }';
      const material = hikari.createMaterial(vertexShader, fragmentShader);
      expect(material).toBeInstanceOf(Material);
    });

    it('should pass uniforms to Material constructor', () => {
      const vertexShader = 'void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }';
      const fragmentShader = 'void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }';
      const uniforms = { test: new Uniform({ type: 'float', value: 1.0 }) };
      const material = hikari.createMaterial(vertexShader, fragmentShader, uniforms);
      expect(material).toBeInstanceOf(Material);
    });
  });

  describe('createPlaneGeometry', () => {
    it('should create and return a PlaneGeometry instance', () => {
      const geometry = hikari.createPlaneGeometry(10, 10);
      expect(geometry).toBeInstanceOf(PlaneGeometry);
    });

    it('should pass parameters to PlaneGeometry constructor', () => {
      const geometry = hikari.createPlaneGeometry(10, 10, 5, 5, 'xy');
      expect(geometry).toBeInstanceOf(PlaneGeometry);
    });
  });

  describe('createMesh', () => {
    it('should create a Mesh instance and add it to meshes array', () => {
      const geometry = new PlaneGeometry(mockWebGLContext as unknown as WebGL2RenderingContext, 10, 10);
      const material = new Material(
        mockWebGLContext as unknown as WebGL2RenderingContext,
        'void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }',
        'void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }',
        {},
        hikari.commonUniforms
      );

      const mesh = hikari.createMesh(geometry, material);
      expect(hikari.meshes).toContain(mesh);
    });
  });
});
