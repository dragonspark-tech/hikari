import { describe, it, expect, vi } from 'vitest';
import { Uniform, uniformTypeFns } from '../../core';

describe('Uniform', () => {
  describe('constructor', () => {
    it('should initialize with default values', () => {
      const uniform = new Uniform({ type: 'float', value: 1.0 });
      
      expect(uniform.type).toBe('float');
      expect(uniform.value).toBe(1.0);
      expect(uniform.excludeFrom).toBeUndefined();
      expect(uniform.transpose).toBe(false);
      expect(uniform.typeFn).toBe('1f');
    });
    
    it('should apply options', () => {
      const uniform = new Uniform({
        type: 'vec3',
        value: [1, 2, 3],
        excludeFrom: 'fragment',
        transpose: true
      });
      
      expect(uniform.type).toBe('vec3');
      expect(uniform.value).toEqual([1, 2, 3]);
      expect(uniform.excludeFrom).toBe('fragment');
      expect(uniform.transpose).toBe(true);
      expect(uniform.typeFn).toBe('3fv');
    });
    
    it('should set the correct typeFn based on type', () => {
      Object.entries(uniformTypeFns).forEach(([type, expectedTypeFn]) => {
        // @ts-expect-error 'type' is already enforced as one of the right typeFNs for the test.
        const uniform = new Uniform({ type, value: null });
        expect(uniform.typeFn).toBe(expectedTypeFn);
      });

      // @ts-expect-error while supported is not part of the defined typeFNs, it should default to 1f.
      const unsupportedUniform = new Uniform({ type: 'unsupported', value: null });
      expect(unsupportedUniform.typeFn).toBe('1f');
    });
  });
  
  describe('update', () => {
    it('should not update if value is undefined', () => {
      // @ts-expect-error 'undefined' is indeed an incorrect value for this uniform, so we have got to test it.
      const uniform = new Uniform({ type: 'float', value: undefined });
      const gl = {
        uniform1f: vi.fn()
      };
      
      uniform.update({} as WebGLUniformLocation, gl as unknown as WebGL2RenderingContext);
      expect(gl.uniform1f).not.toHaveBeenCalled();
    });
    
    it('should not update if location is undefined', () => {
      const uniform = new Uniform({ type: 'float', value: 1.0 });
      const gl = {
        uniform1f: vi.fn()
      };
      
      uniform.update(undefined, gl as unknown as WebGL2RenderingContext);
      expect(gl.uniform1f).not.toHaveBeenCalled();
    });
    
    it('should not update if gl is undefined', () => {
      const uniform = new Uniform({ type: 'float', value: 1.0 });
      uniform.update({} as WebGLUniformLocation, undefined);
      // No assertion needed, just checking it doesn't throw
    });
    
    it('should call the correct uniform function for non-matrix types', () => {
      const types = {
        float: { typeFn: '1f', value: 1.0, mockFn: vi.fn() },
        int: { typeFn: '1i', value: 1, mockFn: vi.fn() },
        vec2: { typeFn: '2fv', value: [1, 2], mockFn: vi.fn() },
        vec3: { typeFn: '3fv', value: [1, 2, 3], mockFn: vi.fn() },
        vec4: { typeFn: '4fv', value: [1, 2, 3, 4], mockFn: vi.fn() }
      };
      
      Object.entries(types).forEach(([type, { typeFn, value, mockFn }]) => {
        // @ts-expect-error 'type' is already enforced as one of the right typeFNs for the test.
        const uniform = new Uniform({ type, value });
        const gl = {
          [`uniform${typeFn}`]: mockFn
        };
        
        const location = {} as WebGLUniformLocation;
        uniform.update(location, gl as unknown as WebGL2RenderingContext);
        
        expect(mockFn).toHaveBeenCalledWith(location, value);
      });
    });
    
    it('should call the correct uniform function for matrix types', () => {
      const uniform = new Uniform({
        type: 'mat4',
        value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        transpose: false
      });
      
      const gl = {
        uniformMatrix4fv: vi.fn()
      };
      
      const location = {} as WebGLUniformLocation;
      uniform.update(location, gl as unknown as WebGL2RenderingContext);
      
      expect(gl.uniformMatrix4fv).toHaveBeenCalledWith(
        location,
        false,
        uniform.value
      );
    });
    
    it('should respect the transpose flag for matrix types', () => {
      const uniform = new Uniform({
        type: 'mat4',
        value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        transpose: true
      });
      
      const gl = {
        uniformMatrix4fv: vi.fn()
      };
      
      const location = {} as WebGLUniformLocation;
      uniform.update(location, gl as unknown as WebGL2RenderingContext);
      
      expect(gl.uniformMatrix4fv).toHaveBeenCalledWith(
        location,
        true,
        uniform.value
      );
    });
  });
  
  describe('getDeclaration', () => {
    it('should return empty string if uniform should be excluded', () => {
      const uniform = new Uniform({
        type: 'float',
        value: 1.0,
        excludeFrom: 'vertex'
      });
      
      const declaration = uniform.getDeclaration('u_test', 'vertex');
      expect(declaration).toBe('');
    });
    
    it('should generate declaration for basic uniform', () => {
      const uniform = new Uniform({ type: 'float', value: 1.0 });
      const declaration = uniform.getDeclaration('u_test', 'vertex');
      expect(declaration).toBe('uniform float u_test;');
    });
    
    it('should generate declaration for array uniform', () => {
      const uniform = new Uniform({
        type: 'array',
        value: [
          new Uniform({ type: 'float', value: 1.0 }),
          new Uniform({ type: 'float', value: 2.0 })
        ]
      });
      
      const declaration = uniform.getDeclaration('u_test', 'vertex');
      expect(declaration).toContain('uniform float u_test[2];');
      expect(declaration).toContain('const int u_test_length = 2;');
    });
    
    it('should generate declaration for struct uniform', () => {
      const uniform = new Uniform({
        type: 'struct',
        value: {
          x: new Uniform({ type: 'float', value: 1.0 }),
          y: new Uniform({ type: 'float', value: 2.0 })
        }
      });
      
      const declaration = uniform.getDeclaration('u_test', 'vertex');
      expect(declaration).toContain('uniform struct Test {');
      expect(declaration).toContain('float x;');
      expect(declaration).toContain('float y;');
      expect(declaration).toContain('} u_test;');
    });
    
    it('should handle array of structs', () => {
      const uniform = new Uniform({
        type: 'array',
        value: [
          new Uniform({
            type: 'struct',
            value: {
              x: new Uniform({ type: 'float', value: 1.0 }),
              y: new Uniform({ type: 'float', value: 2.0 })
            }
          })
        ]
      });
      
      const declaration = uniform.getDeclaration('u_test', 'vertex');
      expect(declaration).toContain('uniform struct Test {');
      expect(declaration).toContain('float x;');
      expect(declaration).toContain('float y;');
      expect(declaration).toContain('} u_test[1];');
      expect(declaration).toContain('const int u_test_length = 1;');
    });
    
    it('should respect excludeFrom in nested uniforms', () => {
      const uniform = new Uniform({
        type: 'struct',
        value: {
          vertexOnly: new Uniform({ type: 'float', value: 1.0, excludeFrom: 'fragment' }),
          fragmentOnly: new Uniform({ type: 'float', value: 2.0, excludeFrom: 'vertex' })
        }
      });
      
      const vertexDeclaration = uniform.getDeclaration('u_test', 'vertex');
      expect(vertexDeclaration).toContain('float vertexOnly;');
      expect(vertexDeclaration).not.toContain('float fragmentOnly;');
      
      const fragmentDeclaration = uniform.getDeclaration('u_test', 'fragment');
      expect(fragmentDeclaration).not.toContain('float vertexOnly;');
      expect(fragmentDeclaration).toContain('float fragmentOnly;');
    });
    
    it('should include length parameter for array types', () => {
      const uniform = new Uniform({ type: 'float', value: 1.0 });
      const declaration = uniform.getDeclaration('u_test', 'vertex', 5);
      expect(declaration).toBe('uniform float u_test[5];');
    });
  });
});