import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HikariGL } from '../';
import { Attribute } from '../core/attribute';
import { Material } from '../core/material';
import { PlaneGeometry } from '../core/plane-geometry';
import { Uniform } from '../core/uniform';
import { mockWebGLContext } from './mocks/mock-webglcontext';

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
      // Create a mock implementation that doesn't actually call the method
      const setSize = vi.spyOn(HikariGL.prototype, 'setSize').mockImplementation(() => {});
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

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
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

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const hikariDebug = new HikariGL({ canvas, debug: true });

      // First debug message
      hikariDebug.debug('First message');
      expect(consoleSpy).toHaveBeenCalled();

      // Change mock date to be 1001ms later
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
      expect(hikari.commonUniforms.projectionMatrix.value).toBeDefined();
      expect(hikari.commonUniforms.projectionMatrix.value.length).toBe(16);
    });

    it('should use default values if not provided', () => {
      hikari.width = 800;
      hikari.height = 600;
      hikari.setOrthographicCamera();
      const matrix = hikari.commonUniforms.projectionMatrix.value;
      expect(matrix[12]).toBe(0); // x
      expect(matrix[13]).toBe(0); // y
      expect(matrix[14]).toBe(0); // z
    });

    it('should use provided values', () => {
      hikari.width = 800;
      hikari.height = 600;
      hikari.setOrthographicCamera(10, 20, 30, -1000, 1000);
      const matrix = hikari.commonUniforms.projectionMatrix.value;
      expect(matrix[12]).toBe(10); // x
      expect(matrix[13]).toBe(20); // y
      expect(matrix[14]).toBe(30); // z
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
      const options = { target: 'ARRAY_BUFFER', size: 3 };
      const attribute = hikari.createAttribute(options);
      expect(attribute).toBeInstanceOf(Attribute);
    });
  });

  describe('createUniform', () => {
    it('should create and return a Uniform instance', () => {
      const options = { type: 'float', value: 1.0 };
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
      const geometry = new PlaneGeometry(mockWebGLContext as unknown as WebGLRenderingContext, 10, 10);
      const material = new Material(
        mockWebGLContext as unknown as WebGLRenderingContext,
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
