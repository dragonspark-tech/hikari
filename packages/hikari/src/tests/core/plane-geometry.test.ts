import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaneGeometry } from '../../core/plane-geometry';
import { mockWebGLContext } from '../mocks/mock-webglcontext';

// Mock Attribute class
vi.mock('../../core/attribute', () => ({
  Attribute: vi.fn().mockImplementation((context, options) => ({
    target: options.target,
    size: options.size,
    type: options.type || context.FLOAT,
    normalized: false,
    buffer: {},
    values: undefined,
    update: vi.fn()
  }))
}));

describe('PlaneGeometry', () => {
  let geometry: PlaneGeometry;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a basic geometry
    geometry = new PlaneGeometry(
      mockWebGLContext as unknown as WebGLRenderingContext,
      10,
      10
    );
  });
  
  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(geometry.width).toBe(10);
      expect(geometry.height).toBe(10);
      expect(geometry.orientation).toBe('xz');
      expect(geometry.xSegCount).toBe(1);
      expect(geometry.ySegCount).toBe(1);
      expect(geometry.vertexCount).toBe(4); // (1+1) * (1+1)
      expect(geometry.quadCount).toBe(2); // 1 * 1 * 2
    });
    
    it('should create attributes', () => {
      expect(geometry.attributes.position).toBeDefined();
      expect(geometry.attributes.uv).toBeDefined();
      expect(geometry.attributes.uvNorm).toBeDefined();
      expect(geometry.attributes.index).toBeDefined();
      
      // Check position attribute
      expect(geometry.attributes.position.target).toBe(mockWebGLContext.ARRAY_BUFFER);
      expect(geometry.attributes.position.size).toBe(3);
      
      // Check uv attribute
      expect(geometry.attributes.uv.target).toBe(mockWebGLContext.ARRAY_BUFFER);
      expect(geometry.attributes.uv.size).toBe(2);
      
      // Check uvNorm attribute
      expect(geometry.attributes.uvNorm.target).toBe(mockWebGLContext.ARRAY_BUFFER);
      expect(geometry.attributes.uvNorm.size).toBe(2);
      
      // Check index attribute
      expect(geometry.attributes.index.target).toBe(mockWebGLContext.ELEMENT_ARRAY_BUFFER);
      expect(geometry.attributes.index.size).toBe(3);
      expect(geometry.attributes.index.type).toBe(mockWebGLContext.UNSIGNED_SHORT);
    });
    
    it('should call setTopology and setSize', () => {
      const setTopologySpy = vi.spyOn(PlaneGeometry.prototype, 'setTopology');
      const setSizeSpy = vi.spyOn(PlaneGeometry.prototype, 'setSize');
      
      new PlaneGeometry(
        mockWebGLContext as unknown as WebGLRenderingContext,
        20,
        30,
        2,
        3,
        'xy'
      );
      
      expect(setTopologySpy).toHaveBeenCalledWith(2, 3);
      expect(setSizeSpy).toHaveBeenCalledWith(20, 30, 'xy');
    });
  });
  
  describe('setTopology', () => {
    it('should set segment counts and calculate vertex and quad counts', () => {
      geometry.setTopology(2, 3);
      
      expect(geometry.xSegCount).toBe(2);
      expect(geometry.ySegCount).toBe(3);
      expect(geometry.vertexCount).toBe(12); // (2+1) * (3+1)
      expect(geometry.quadCount).toBe(12); // 2 * 3 * 2
    });
    
    it('should create attribute arrays with correct sizes', () => {
      geometry.setTopology(2, 3);
      
      expect(geometry.attributes.uv.values).toBeInstanceOf(Float32Array);
      expect(geometry.attributes.uv.values!.length).toBe(2 * 12); // 2 components * 12 vertices
      
      expect(geometry.attributes.uvNorm.values).toBeInstanceOf(Float32Array);
      expect(geometry.attributes.uvNorm.values!.length).toBe(2 * 12); // 2 components * 12 vertices
      
      expect(geometry.attributes.index.values).toBeInstanceOf(Uint16Array);
      expect(geometry.attributes.index.values!.length).toBe(3 * 12); // 3 indices * 12 triangles
    });
    
    it('should generate UV coordinates and indices', () => {
      geometry.setTopology(1, 1); // Simple 2x2 grid (4 vertices, 2 quads)
      
      // Check UV coordinates
      expect(geometry.attributes.uv.values![0]).toBe(0); // x for vertex 0
      expect(geometry.attributes.uv.values![1]).toBe(1); // y for vertex 0
      expect(geometry.attributes.uv.values![2]).toBe(1); // x for vertex 1
      expect(geometry.attributes.uv.values![3]).toBe(1); // y for vertex 1
      expect(geometry.attributes.uv.values![4]).toBe(0); // x for vertex 2
      expect(geometry.attributes.uv.values![5]).toBe(0); // y for vertex 2
      expect(geometry.attributes.uv.values![6]).toBe(1); // x for vertex 3
      expect(geometry.attributes.uv.values![7]).toBe(0); // y for vertex 3
      
      // Check normalized UV coordinates
      expect(geometry.attributes.uvNorm.values![0]).toBe(-1); // x for vertex 0
      expect(geometry.attributes.uvNorm.values![1]).toBe(1); // y for vertex 0
      expect(geometry.attributes.uvNorm.values![2]).toBe(1); // x for vertex 1
      expect(geometry.attributes.uvNorm.values![3]).toBe(1); // y for vertex 1
      expect(geometry.attributes.uvNorm.values![4]).toBe(-1); // x for vertex 2
      expect(geometry.attributes.uvNorm.values![5]).toBe(-1); // y for vertex 2
      expect(geometry.attributes.uvNorm.values![6]).toBe(1); // x for vertex 3
      expect(geometry.attributes.uvNorm.values![7]).toBe(-1); // y for vertex 3
      
      // Check indices for the two triangles
      expect(geometry.attributes.index.values![0]).toBe(0); // First triangle, vertex 1
      expect(geometry.attributes.index.values![1]).toBe(2); // First triangle, vertex 2
      expect(geometry.attributes.index.values![2]).toBe(1); // First triangle, vertex 3
      expect(geometry.attributes.index.values![3]).toBe(1); // Second triangle, vertex 1
      expect(geometry.attributes.index.values![4]).toBe(2); // Second triangle, vertex 2
      expect(geometry.attributes.index.values![5]).toBe(3); // Second triangle, vertex 3
    });
    
    it('should update attribute buffers', () => {
      geometry.setTopology(2, 2);
      
      expect(geometry.attributes.uv.update).toHaveBeenCalled();
      expect(geometry.attributes.uvNorm.update).toHaveBeenCalled();
      expect(geometry.attributes.index.update).toHaveBeenCalled();
    });
  });
  
  describe('setSize', () => {
    it('should set width, height, and orientation', () => {
      geometry.setSize(20, 30, 'xy');
      
      expect(geometry.width).toBe(20);
      expect(geometry.height).toBe(30);
      expect(geometry.orientation).toBe('xy');
    });
    
    it('should create position array if it does not exist', () => {
      geometry.attributes.position.values = undefined;
      geometry.setSize(20, 30);
      
      expect(geometry.attributes.position.values).toBeInstanceOf(Float32Array);
      expect(geometry.attributes.position.values!.length).toBe(3 * 4); // 3 components * 4 vertices
    });
    
    it('should create position array if it has wrong size', () => {
      geometry.attributes.position.values = new Float32Array(10); // Wrong size
      geometry.vertexCount = 4;
      geometry.setSize(20, 30);
      
      expect(geometry.attributes.position.values).toBeInstanceOf(Float32Array);
      expect(geometry.attributes.position.values!.length).toBe(3 * 4); // 3 components * 4 vertices
    });
    
    it('should generate vertex positions based on orientation', () => {
      // Test 'xz' orientation (default)
      geometry.setTopology(1, 1); // 2x2 grid
      geometry.setSize(10, 10, 'xz');
      
      // For 'xz' orientation, x and z coordinates are set, y is 0
      const posArray = geometry.attributes.position.values!;
      
      // Check x coordinates (index 0, 3, 6, 9)
      expect(posArray[0]).toBe(-5); // Vertex 0, x
      expect(posArray[3]).toBe(5); // Vertex 1, x
      expect(posArray[6]).toBe(-5); // Vertex 2, x
      expect(posArray[9]).toBe(5); // Vertex 3, x
      
      // Check z coordinates (index 2, 5, 8, 11)
      expect(posArray[2]).toBe(5); // Vertex 0, z
      expect(posArray[5]).toBe(5); // Vertex 1, z
      expect(posArray[8]).toBe(-5); // Vertex 2, z
      expect(posArray[11]).toBe(-5); // Vertex 3, z
      
      // Test 'xy' orientation
      geometry.setSize(10, 10, 'xy');
      
      // For 'xy' orientation, x and y coordinates are set, z is 0
      // Check y coordinates (index 1, 4, 7, 10)
      expect(posArray[1]).toBe(5); // Vertex 0, y
      expect(posArray[4]).toBe(5); // Vertex 1, y
      expect(posArray[7]).toBe(-5); // Vertex 2, y
      expect(posArray[10]).toBe(-5); // Vertex 3, y
    });
    
    it('should update position buffer', () => {
      geometry.setSize(20, 30);
      expect(geometry.attributes.position.update).toHaveBeenCalled();
    });
  });
});