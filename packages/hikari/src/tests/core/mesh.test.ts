import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Material, Mesh, PlaneGeometry } from '../../core';
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


// Mock Material
vi.mock('../../core/material', () => ({
  Material: vi.fn().mockImplementation(() => ({
    program: {},
    uniformInstances: [
      {
        uniform: { update: vi.fn() },
        location: {}
      }
    ]
  }))
}));

// Mock PlaneGeometry
vi.mock('../../core/plane-geometry', () => ({
  PlaneGeometry: vi.fn().mockImplementation(() => ({
    attributes: {
      position: {
        attach: vi.fn(() => 0),
        use: vi.fn()
      },
      uv: {
        attach: vi.fn(() => 1),
        use: vi.fn()
      },
      uvNorm: {
        attach: vi.fn(() => 2),
        use: vi.fn()
      },
      index: {
        attach: vi.fn(() => 3),
        use: vi.fn(),
        values: new Uint16Array([0, 1, 2, 0, 2, 3])
      }
    }
  }))
}));

describe('Mesh', () => {
  let mesh: Mesh;
  let geometry: PlaneGeometry;
  let material: Material;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create geometry and material
    geometry = new PlaneGeometry(mockWebGLContext as unknown as WebGL2RenderingContext, 10, 10);
    material = new Material(
      mockWebGLContext as unknown as WebGL2RenderingContext,
      'void main() {}',
      'void main() {}',
      {},
      {} as CommonUniforms
    );
    
    // Create mesh
    mesh = new Mesh(mockWebGLContext as unknown as WebGL2RenderingContext, geometry, material);
  });
  
  describe('constructor', () => {
    it('should initialize with provided values', () => {
      expect(mesh.geometry).toBe(geometry);
      expect(mesh.material).toBe(material);
      expect(mesh.wireframe).toBe(false);
      expect(mesh.attributeInstances).toBeDefined();
      expect(mesh.attributeInstances.length).toBe(4); // position, uv, uvNorm, index
    });
    
    it('should create attribute instances for each geometry attribute', () => {
      // Check that the 'attach' method was called for each attribute
      expect(geometry.attributes.position.attach).toHaveBeenCalledWith('position', material.program);
      expect(geometry.attributes.uv.attach).toHaveBeenCalledWith('uv', material.program);
      expect(geometry.attributes.uvNorm.attach).toHaveBeenCalledWith('uvNorm', material.program);
      expect(geometry.attributes.index.attach).toHaveBeenCalledWith('index', material.program);
      
      // Check that attribute instances were created
      expect(mesh.attributeInstances[0].attribute).toBe(geometry.attributes.position);
      expect(mesh.attributeInstances[0].location).toBe(0);
      
      expect(mesh.attributeInstances[1].attribute).toBe(geometry.attributes.uv);
      expect(mesh.attributeInstances[1].location).toBe(1);
      
      expect(mesh.attributeInstances[2].attribute).toBe(geometry.attributes.uvNorm);
      expect(mesh.attributeInstances[2].location).toBe(2);
      
      expect(mesh.attributeInstances[3].attribute).toBe(geometry.attributes.index);
      expect(mesh.attributeInstances[3].location).toBe(3);
    });
  });
  
  describe('draw', () => {
    it('should use the material program', () => {
      mesh.draw();
      expect(mockWebGLContext.useProgram).toHaveBeenCalledWith(material.program);
    });
    
    it('should update all uniform instances', () => {
      mesh.draw();
      expect(material.uniformInstances[0].uniform.update).toHaveBeenCalledWith(
        material.uniformInstances[0].location,
        mockWebGLContext
      );
    });
    
    it('should use all attribute instances', () => {
      mesh.draw();
      
      // Check that use was called for each attribute
      expect(geometry.attributes.position.use).toHaveBeenCalledWith(0);
      expect(geometry.attributes.uv.use).toHaveBeenCalledWith(1);
      expect(geometry.attributes.uvNorm.use).toHaveBeenCalledWith(2);
      expect(geometry.attributes.index.use).toHaveBeenCalledWith(3);
    });
    
    it('should draw elements with TRIANGLES mode by default', () => {
      mesh.draw();
      
      expect(mockWebGLContext.drawElements).toHaveBeenCalledWith(
        mockWebGLContext.TRIANGLES,
        geometry.attributes.index.values!.length,
        mockWebGLContext.UNSIGNED_SHORT,
        0
      );
    });
    
    it('should draw elements with LINES mode if wireframe is true', () => {
      mesh.wireframe = true;
      mesh.draw();
      
      expect(mockWebGLContext.drawElements).toHaveBeenCalledWith(
        mockWebGLContext.LINES,
        geometry.attributes.index.values!.length,
        mockWebGLContext.UNSIGNED_SHORT,
        0
      );
    });
  });
});