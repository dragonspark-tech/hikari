import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Material, Uniform, UniformType } from '../../core';
import { CommonUniforms } from '../../hikari';

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

// Mock console.error
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('Material', () => {
  let material: Material;
  let vertexShader: string;
  let fragmentShader: string;
  let uniforms: Record<string, Uniform<UniformType>>;
  let commonUniforms: CommonUniforms;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create basic shader sources
    vertexShader = 'void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }';
    fragmentShader = 'void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }';
    
    // Create uniforms
    uniforms = {
      color: new Uniform({ type: 'vec4', value: [1, 0, 0, 1] })
    };
    
    commonUniforms = {
      projectionMatrix: new Uniform({ type: 'mat4', value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }),
      resolution: new Uniform({ type: 'vec2', value: [800, 600] }),
      modelViewMatrix: new Uniform({ type: 'mat4', value: []}),
      aspectRatio: new Uniform({ type: 'float', value: 1})
    };
    
    // Create material
    material = new Material(
      mockWebGLContext as unknown as WebGL2RenderingContext,
      vertexShader,
      fragmentShader,
      uniforms,
      commonUniforms
    );
  });
  
  describe('constructor', () => {
    it('should initialize with provided values', () => {
      expect(material.vertexSource).toContain(vertexShader);
      expect(material.fragmentSource).toContain(fragmentShader);
      expect(material.uniforms).toBe(uniforms);
      expect(material.program).toBeDefined();
      expect(material.vertexShader).toBeDefined();
      expect(material.fragmentShader).toBeDefined();
    });
    
    it('should create and compile shaders', () => {
      expect(mockWebGLContext.createShader).toHaveBeenCalledTimes(2);
      expect(mockWebGLContext.shaderSource).toHaveBeenCalledTimes(2);
      expect(mockWebGLContext.compileShader).toHaveBeenCalledTimes(2);
      expect(mockWebGLContext.getShaderParameter).toHaveBeenCalledTimes(2);
    });
    
    it('should create and link program', () => {
      expect(mockWebGLContext.createProgram).toHaveBeenCalledTimes(1);
      expect(mockWebGLContext.attachShader).toHaveBeenCalledTimes(2);
      expect(mockWebGLContext.linkProgram).toHaveBeenCalledTimes(1);
      expect(mockWebGLContext.getProgramParameter).toHaveBeenCalledTimes(1);
    });
    
    it('should log error if shader compilation fails', () => {
      // Mock shader compilation failure
      mockWebGLContext.getShaderParameter.mockReturnValueOnce(false);
      
      new Material(
        mockWebGLContext as unknown as WebGL2RenderingContext,
        vertexShader,
        fragmentShader,
        uniforms,
        commonUniforms
      );
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(mockWebGLContext.getShaderInfoLog).toHaveBeenCalledTimes(1);
    });
    
    it('should log error if program linking fails', () => {
      // Mock program linking failure
      mockWebGLContext.getProgramParameter.mockReturnValueOnce(false);
      
      new Material(
        mockWebGLContext as unknown as WebGL2RenderingContext,
        vertexShader,
        fragmentShader,
        uniforms,
        commonUniforms
      );
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(mockWebGLContext.getProgramInfoLog).toHaveBeenCalledTimes(1);
    });
    
    it('should use program and attach uniforms', () => {
      expect(mockWebGLContext.useProgram).toHaveBeenCalledTimes(1);
      expect(mockWebGLContext.useProgram).toHaveBeenCalledWith(material.program);
      expect(mockWebGLContext.getUniformLocation).toHaveBeenCalled();
    });
  });
  
  describe('attachUniforms', () => {
    it('should process all uniforms if name is undefined', () => {
      const attachUniformsSpy = vi.spyOn(material, 'attachUniforms');
      material.attachUniforms(undefined, uniforms);
      
      // Should call attachUniforms for each uniform in the collection
      expect(attachUniformsSpy).toHaveBeenCalledTimes(2); // Once for the initial call, once for the 'color' uniform
      expect(attachUniformsSpy).toHaveBeenCalledWith('color', uniforms.color);
    });
    
    it('should return early if name or uniforms is undefined', () => {
      const getUniformLocationSpy = vi.spyOn(mockWebGLContext, 'getUniformLocation');
      
      material.attachUniforms(undefined, undefined);
      material.attachUniforms('test', undefined);
      material.attachUniforms(undefined, {});
      
      expect(getUniformLocationSpy).not.toHaveBeenCalled();
    });
    
    it('should handle array type uniforms', () => {
      const arrayUniform = new Uniform({
        type: 'array',
        value: [
          new Uniform({ type: 'float', value: 1.0 }),
          new Uniform({ type: 'float', value: 2.0 })
        ]
      });
      
      const attachUniformsSpy = vi.spyOn(material, 'attachUniforms');
      material.attachUniforms('testArray', arrayUniform);
      
      // Should call attachUniforms for each item in the array
      expect(attachUniformsSpy).toHaveBeenCalledWith('testArray[0]', arrayUniform.value[0]);
      expect(attachUniformsSpy).toHaveBeenCalledWith('testArray[1]', arrayUniform.value[1]);
    });
    
    it('should handle struct type uniforms', () => {
      const structUniform = new Uniform({
        type: 'struct',
        value: {
          x: new Uniform({ type: 'float', value: 1.0 }),
          y: new Uniform({ type: 'float', value: 2.0 })
        }
      });
      
      const attachUniformsSpy = vi.spyOn(material, 'attachUniforms');
      material.attachUniforms('testStruct', structUniform);
      
      // Should call attachUniforms for each field in the struct
      expect(attachUniformsSpy).toHaveBeenCalledWith('testStruct.x', structUniform.value.x);
      expect(attachUniformsSpy).toHaveBeenCalledWith('testStruct.y', structUniform.value.y);
    });
    
    it('should add uniform instance for basic uniforms', () => {
      const basicUniform = new Uniform({ type: 'float', value: 1.0 });
      material.uniformInstances = []; // Clear existing instances
      
      material.attachUniforms('testFloat', basicUniform);
      
      expect(material.uniformInstances.length).toBe(1);
      expect(material.uniformInstances[0].uniform).toBe(basicUniform);
      expect(mockWebGLContext.getUniformLocation).toHaveBeenCalledWith(material.program, 'testFloat');
    });
  });
  
  describe('getShaderByType', () => {
    it('should create and compile shader of specified type', () => {
      const shader = (material as any).getShaderByType(
        mockWebGLContext.VERTEX_SHADER,
        'void main() {}'
      );
      
      expect(mockWebGLContext.createShader).toHaveBeenCalledWith(mockWebGLContext.VERTEX_SHADER);
      expect(mockWebGLContext.shaderSource).toHaveBeenCalledWith(shader, 'void main() {}');
      expect(mockWebGLContext.compileShader).toHaveBeenCalledWith(shader);
      expect(mockWebGLContext.getShaderParameter).toHaveBeenCalledWith(shader, mockWebGLContext.COMPILE_STATUS);
    });
    
    it('should log error if compilation fails', () => {
      // Mock compilation failure
      mockWebGLContext.getShaderParameter.mockReturnValueOnce(false);
      
      (material as any).getShaderByType(
        mockWebGLContext.VERTEX_SHADER,
        'invalid shader code'
      );
      
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(mockWebGLContext.getShaderInfoLog).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('getUniformVariableDeclarations', () => {
    it('should generate declarations for all uniforms', () => {
      const declarations = (material as any).getUniformVariableDeclarations(uniforms, 'vertex');
      
      expect(declarations).toContain('uniform vec4 color;');
    });
    
    it('should join declarations with newlines', () => {
      const multipleUniforms = {
        color: new Uniform({ type: 'vec4', value: [1, 0, 0, 1] }),
        scale: new Uniform({ type: 'float', value: 2.0 })
      };
      
      const declarations = (material as any).getUniformVariableDeclarations(multipleUniforms, 'vertex');
      
      expect(declarations.split('\n').length).toBe(2);
      expect(declarations).toContain('uniform vec4 color;');
      expect(declarations).toContain('uniform float scale;');
    });
    
    it('should respect excludeFrom property', () => {
      const excludedUniform = {
        vertexOnly: new Uniform({ type: 'vec3', value: [1, 2, 3], excludeFrom: 'fragment' }),
        fragmentOnly: new Uniform({ type: 'float', value: 1.0, excludeFrom: 'vertex' })
      };
      
      const vertexDeclarations = (material as any).getUniformVariableDeclarations(excludedUniform, 'vertex');
      const fragmentDeclarations = (material as any).getUniformVariableDeclarations(excludedUniform, 'fragment');
      
      expect(vertexDeclarations).toContain('uniform vec3 vertexOnly;');
      expect(vertexDeclarations).not.toContain('uniform float fragmentOnly;');
      
      expect(fragmentDeclarations).not.toContain('uniform vec3 vertexOnly;');
      expect(fragmentDeclarations).toContain('uniform float fragmentOnly;');
    });
  });
});