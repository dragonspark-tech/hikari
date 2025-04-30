import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Attribute } from '../../core/attribute';
import { mockWebGLContext } from '../mocks/mock-webglcontext';

describe('Attribute', () => {
  let attribute: Attribute;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a basic attribute
    attribute = new Attribute(mockWebGLContext as unknown as WebGL2RenderingContext, {
      target: mockWebGLContext.ARRAY_BUFFER,
      size: 3
    });
  });
  
  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(attribute.target).toBe(mockWebGLContext.ARRAY_BUFFER);
      expect(attribute.size).toBe(3);
      expect(attribute.type).toBe(mockWebGLContext.FLOAT);
      expect(attribute.normalized).toBe(false);
      expect(attribute.buffer).toBeDefined();
      expect(mockWebGLContext.createBuffer).toHaveBeenCalled();
    });
    
    it('should apply options', () => {
      const customAttribute = new Attribute(mockWebGLContext as unknown as WebGLRenderingContext, {
        target: mockWebGLContext.ELEMENT_ARRAY_BUFFER,
        size: 2,
        type: 5126, // WebGL FLOAT value
        normalized: true,
        values: new Float32Array([1, 2, 3])
      });
      
      expect(customAttribute.target).toBe(mockWebGLContext.ELEMENT_ARRAY_BUFFER);
      expect(customAttribute.size).toBe(2);
      expect(customAttribute.type).toBe(5126);
      expect(customAttribute.normalized).toBe(true);
      expect(customAttribute.values).toEqual(new Float32Array([1, 2, 3]));
    });
    
    it('should call update method', () => {
      const updateSpy = vi.spyOn(Attribute.prototype, 'update');
      new Attribute(mockWebGLContext as unknown as WebGLRenderingContext, {
        target: mockWebGLContext.ARRAY_BUFFER,
        size: 3
      });
      expect(updateSpy).toHaveBeenCalled();
    });
  });
  
  describe('update', () => {
    it('should not call bufferData if values is undefined', () => {
      attribute.values = undefined;
      attribute.update();
      expect(mockWebGLContext.bindBuffer).not.toHaveBeenCalled();
      expect(mockWebGLContext.bufferData).not.toHaveBeenCalled();
    });
    
    it('should call bufferData with correct parameters if values is defined', () => {
      const values = new Float32Array([1, 2, 3]);
      attribute.values = values;
      attribute.update();
      
      expect(mockWebGLContext.bindBuffer).toHaveBeenCalledWith(attribute.target, attribute.buffer);
      expect(mockWebGLContext.bufferData).toHaveBeenCalledWith(
        attribute.target,
        values,
        mockWebGLContext.STATIC_DRAW
      );
    });
  });
  
  describe('attach', () => {
    it('should get attribute location and return it', () => {
      const program = {};
      const location = attribute.attach('position', program as WebGLProgram);
      
      expect(mockWebGLContext.getAttribLocation).toHaveBeenCalledWith(program, 'position');
      expect(location).toBe(0);
    });
    
    it('should enable vertex attribute array and set pointer if target is ARRAY_BUFFER', () => {
      attribute.target = mockWebGLContext.ARRAY_BUFFER;
      const program = {};
      attribute.attach('position', program as WebGLProgram);
      
      expect(mockWebGLContext.enableVertexAttribArray).toHaveBeenCalledWith(0);
      expect(mockWebGLContext.vertexAttribPointer).toHaveBeenCalledWith(
        0,
        attribute.size,
        attribute.type,
        attribute.normalized,
        0,
        0
      );
    });
    
    it('should not enable vertex attribute array if target is not ARRAY_BUFFER', () => {
      attribute.target = mockWebGLContext.ELEMENT_ARRAY_BUFFER;
      const program = {};
      attribute.attach('index', program as WebGLProgram);
      
      expect(mockWebGLContext.enableVertexAttribArray).not.toHaveBeenCalled();
      expect(mockWebGLContext.vertexAttribPointer).not.toHaveBeenCalled();
    });
  });
  
  describe('use', () => {
    it('should bind buffer', () => {
      attribute.use(0);
      expect(mockWebGLContext.bindBuffer).toHaveBeenCalledWith(attribute.target, attribute.buffer);
    });
    
    it('should enable vertex attribute array and set pointer if target is ARRAY_BUFFER', () => {
      attribute.target = mockWebGLContext.ARRAY_BUFFER;
      attribute.use(0);
      
      expect(mockWebGLContext.enableVertexAttribArray).toHaveBeenCalledWith(0);
      expect(mockWebGLContext.vertexAttribPointer).toHaveBeenCalledWith(
        0,
        attribute.size,
        attribute.type,
        attribute.normalized,
        0,
        0
      );
    });
    
    it('should not enable vertex attribute array if target is not ARRAY_BUFFER', () => {
      attribute.target = mockWebGLContext.ELEMENT_ARRAY_BUFFER;
      attribute.use(0);
      
      expect(mockWebGLContext.enableVertexAttribArray).not.toHaveBeenCalled();
      expect(mockWebGLContext.vertexAttribPointer).not.toHaveBeenCalled();
    });
  });
});