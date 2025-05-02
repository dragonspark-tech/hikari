// hikari.ts
import {
  Attribute,
  AttributeOptions,
  Material,
  Mesh,
  PlaneGeometry,
  Uniform,
  UniformOptions,
  UniformType
} from './core';

export interface CommonUniforms {
  projectionMatrix: Uniform<'mat4'>;
  modelViewMatrix: Uniform<'mat4'>;
  resolution: Uniform<'vec2'>;
  aspectRatio: Uniform;

  [key: string]: Uniform<UniformType>;
}

export interface HikariGLOptions {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  debug?: boolean;
}

/**
 * HikariGL is a WebGL helper class designed to ease the management of WebGL contexts,
 * rendering pipelines, and common geometries and materials.
 */
export class HikariGL {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  meshes: Mesh[] = [];
  width!: number;
  height!: number;
  debug: (message: string, ...args: (string | object)[]) => void;
  commonUniforms: CommonUniforms;

  private lastDebugMsg?: Date;

  /**
   * Constructs a new instance of the class with the provided options.
   *
   * @param options - The initialization options for the class.
   * @param options.canvas - The canvas element used for WebGL rendering.
   * @param [options.width] - The width to set for the rendering context (optional).
   * @param [options.height] - The height to set for the rendering context (optional).
   * @param [options.debug=false] - Whether to enable debug mode (optional).
   */
  constructor(options: HikariGLOptions) {
    const { canvas, width, height, debug = false } = options;
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { antialias: true }) as WebGL2RenderingContext;

    if (width && height) this.setSize(width, height);

    this.debug =
      debug
        ? (msg, ...args) => {
            const now = new Date();
            if (!this.lastDebugMsg || now.getTime() - this.lastDebugMsg.getTime() > 1000)
              console.log('---');
            console.log(now.toLocaleTimeString(), msg, ...args);
            this.lastDebugMsg = now;
          }
        : () => void 0;

    const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    this.commonUniforms = {
      projectionMatrix: new Uniform({ type: 'mat4', value: I4 }),
      modelViewMatrix: new Uniform({ type: 'mat4', value: I4 }),
      resolution: new Uniform({ type: 'vec2', value: [1, 1] }),
      aspectRatio: new Uniform({ type: 'float', value: 1 })
    };
  }

  /**
   * Sets the size of the canvas and updates the relevant properties and uniforms.
   *
   * @param [width=640] - The desired width of the canvas.
   * @param [height=480] - The desired height of the canvas.
   */
  setSize(width = 640, height = 480): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);

    this.commonUniforms.resolution.value = [width, height];
    this.commonUniforms.aspectRatio.value = width / height;

    this.debug('HikariGL.setSize', { width, height });
  }

  /**
   * Configures the projection matrix for an orthographic camera.
   *
   * @param [x=0] The x-coordinate for the camera position.
   * @param [y=0] The y-coordinate for the camera position.
   * @param [z=0] The z-coordinate for the camera position.
   * @param [near=-2000] The near clipping plane distance.
   * @param [far=2000] The far clipping plane distance.
   */
  setOrthographicCamera(x = 0, y = 0, z = 0, near = -2000, far = 2000): void {
    // prettier-ignore
    this.commonUniforms.projectionMatrix.value = [
      2 / this.width, 0, 0, 0, 0,
      2 / this.height, 0, 0, 0, 0,
      2 / (near - far), 0, x, y, z,
      1
    ];
    this.debug('setOrthographicCamera', this.commonUniforms.projectionMatrix.value);
  }

  /**
   * Renders objects to the context by clearing the canvas and invoking the draw method
   * for each mesh in the collection.
   */
  render(): void {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clearDepth(1);
    this.meshes.forEach((m) => m.draw());
  }

  /**
   * Creates and returns a new attribute instance based on the provided options.
   *
   * @param {AttributeOptions} options - The configuration options for the attribute,
   *                                     including settings like data type and size.
   * @return The newly created attribute instance.
   */
  createAttribute(options: AttributeOptions): Attribute {
    return new Attribute(this.gl, options);
  }

  /**
   * Creates a new uniform instance with the specified options.
   *
   * @template T
   * @param {UniformOptions<T>} options - The options for configuring the uniform instance.
   * @return The created uniform instance.
   */
  createUniform<T extends UniformType>(options: UniformOptions<T>): Uniform<T> {
    return new Uniform(options);
  }

  /**
   * Creates and returns a new Material instance
   * using the provided vertex and fragment shaders along with optional uniforms.
   *
   * @param vertexShaders - The GLSL code for the vertex shader.
   * @param fragmentShaders - The GLSL code for the fragment shader.
   * @param [uniforms={}] - An optional set of uniform values for the shader program.
   * @return The created Material instance.
   */
  createMaterial(
    vertexShaders: string,
    fragmentShaders: string,
    uniforms: Record<string, Uniform<UniformType>> = {}
  ): Material {
    return new Material(this.gl, vertexShaders, fragmentShaders, uniforms, this.commonUniforms);
  }

  /**
   * Creates a plane geometry object with specified dimensions, segments, and orientation.
   *
   * @param width - The width of the plane.
   * @param height - The height of the plane.
   * @param [xSeg=1] - The number of width segments, default is 1.
   * @param [ySeg=1] - The number of height segments, default is 1.
   * @param [orient='xz'] - The orientation of the plane, default is 'xz'.
   * @return The created PlaneGeometry object.
   */
  createPlaneGeometry(
    width: number,
    height: number,
    xSeg = 1,
    ySeg = 1,
    orient: 'xz' | 'xy' | 'yz' = 'xz'
  ): PlaneGeometry {
    return new PlaneGeometry(this.gl, width, height, xSeg, ySeg, orient);
  }

  /**
   * Creates a new mesh with the provided geometry and material,
   * adds it to the internal mesh collection, and returns the created mesh.
   *
   * @param geometry - The geometry object defining the shape of the mesh.
   * @param material - The material object defining the appearance of the mesh.
   * @return The created mesh object.
   */
  createMesh(geometry: PlaneGeometry, material: Material): Mesh {
    const m = new Mesh(this.gl, geometry, material);
    this.meshes.push(m);
    return m;
  }
}
