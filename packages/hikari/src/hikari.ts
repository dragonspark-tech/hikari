import { Mesh } from './core/mesh';
import { Uniform } from './core/uniform';
import { Attribute } from './core/attribute';
import { Material } from './core/material';
import { PlaneGeometry } from './core/plane-geometry';

export interface HikariGLOptions {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  debug?: boolean;
}

/**
 * HikariGL is a WebGL helper class designed to ease the management of WebGL contexts,
 * rendering pipelines, and common geometries and materials. It provides utility functions
 * to set camera projections, manage canvas size, and create various WebGL components.
 */
export class HikariGL {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  meshes: Mesh[] = [];
  width!: number;
  height!: number;
  debug: (message: string, ...args: any[]) => void;
  commonUniforms: Record<string, Uniform>;
  private lastDebugMsg?: Date;

  /**
   * Constructs a new instance of the object with specified options.
   *
   * @param {HikariGLOptions} options - The configuration object for the constructor.
   * @param {HTMLCanvasElement} options.canvas - The HTML canvas element to render WebGL content on.
   * @param {number} [options.width] - The initial width of the canvas (optional).
   * @param {number} [options.height] - The initial height of the canvas (optional).
   * @param {boolean} [options.debug=false] - Enables WebGL debugging mode if set to true (optional).
   * @return {void}
   */
  constructor(options: HikariGLOptions) {
    const { canvas, width, height, debug = false } = options;

    // Store canvas and get WebGL context
    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl', { antialias: true }) as WebGLRenderingContext;

    // Set initial size if provided
    if (width && height) {
      this.setSize(width, height);
    }

    // Set up debug function
    const debugOutput = document.location.search.toLowerCase().indexOf('debug=webgl') !== -1;
    this.debug =
      debug && debugOutput
        ? (message: string, ...args: any[]) => {
            const now = new Date();
            if (!this.lastDebugMsg || now.getTime() - this.lastDebugMsg.getTime() > 1000) {
              console.log('---');
            }

            console.log(
              now.toLocaleTimeString() +
                Array(Math.max(0, 32 - message.length)).join(' ') +
                message +
                ': ',
              ...args
            );

            this.lastDebugMsg = now;
          }
        : () => {};

    // Initialize common uniforms
    const identityMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    this.commonUniforms = {
      projectionMatrix: new Uniform({
        type: 'mat4',
        value: identityMatrix
      }),
      modelViewMatrix: new Uniform({
        type: 'mat4',
        value: identityMatrix
      }),
      resolution: new Uniform({
        type: 'vec2',
        value: [1, 1]
      }),
      aspectRatio: new Uniform({
        type: 'float',
        value: 1
      })
    };
  }

  /**
   * Sets the size of the canvas and updates related properties including WebGL viewport, uniforms, and debug information.
   *
   * @param {number} [width=640] - The new width of the canvas. Defaults to 640 if not provided.
   * @param {number} [height=480] - The new height of the canvas. Defaults to 480 if not provided.
   * @return {void} This method does not return any value.
   */
  setSize(width: number = 640, height: number = 480): void {
    this.width = width;
    this.height = height;

    // Update canvas size
    this.canvas.width = width;
    this.canvas.height = height;

    // Update WebGL viewport
    this.gl.viewport(0, 0, width, height);

    // Update uniforms
    this.commonUniforms.resolution.value = [width, height];
    this.commonUniforms.aspectRatio.value = width / height;

    // Log debug info
    this.debug('HikariGL.setSize', { width, height });
  }

  /**
   * Sets the orthographic camera projection for the 3D rendering context.
   * This method establishes the projection matrix based on the provided position and near/far plane distances.
   *
   * @param {number} [x=0] The x-coordinate of the orthographic camera's position.
   * @param {number} [y=0] The y-coordinate of the orthographic camera's position.
   * @param {number} [z=0] The z-coordinate of the orthographic camera's position.
   * @param {number} [near=-2000] The near clipping plane distance.
   * @param {number} [far=2000] The far clipping plane distance.
   * @return {void} No value is returned.
   */
  setOrthographicCamera(
    x: number = 0,
    y: number = 0,
    z: number = 0,
    near: number = -2000,
    far: number = 2000
  ): void {
    // Create orthographic projection matrix
    this.commonUniforms.projectionMatrix.value = [
      2 / this.width,
      0,
      0,
      0,
      0,
      2 / this.height,
      0,
      0,
      0,
      0,
      2 / (near - far),
      0,
      x,
      y,
      z,
      1
    ];

    // Log debug info
    this.debug('setOrthographicCamera', this.commonUniforms.projectionMatrix.value);
  }

  /**
   * Renders the current frame to the canvas by clearing the background and drawing all available meshes.
   *
   * @return {void} This method does not return a value.
   */
  render(): void {
    // Clear the canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clearDepth(1);

    // Draw all meshes
    this.meshes.forEach((mesh) => mesh.draw());
  }

  /**
   * Creates a new attribute based on the provided options.
   *
   * @param {any} options - The configuration options for creating the attribute.
   * @return {Attribute} The newly created attribute instance.
   */
  createAttribute(options: any): Attribute {
    return new Attribute(this.gl, options);
  }

  /**
   * Creates and returns a new Uniform instance using the provided options.
   *
   * @param {any} options - Configuration options for creating the Uniform instance.
   * @return {Uniform} A new instance of the Uniform class based on the provided options.
   */
  createUniform(options: any): Uniform {
    return new Uniform(options);
  }

  /**
   * Creates and returns a material instance by compiling the provided vertex and fragment shaders, and applying uniforms.
   *
   * @param {string} vertexShaders - The source code of the vertex shader to be compiled.
   * @param {string} fragmentShaders - The source code of the fragment shader to be compiled.
   * @param {Record<string, Uniform>} [uniforms={}] - An optional record of uniform variable mappings to be applied to the material.
   * @return {Material} The created material instance.
   */
  createMaterial(
    vertexShaders: string,
    fragmentShaders: string,
    uniforms: Record<string, Uniform> = {}
  ): Material {
    return new Material(this.gl, vertexShaders, fragmentShaders, uniforms, this.commonUniforms);
  }

  /**
   * Creates a plane geometry with specified dimensions, segment divisions, and orientation.
   *
   * @param {number} width - The width of the plane.
   * @param {number} height - The height of the plane.
   * @param {number} [xSegments=1] - The number of horizontal segments.
   * @param {number} [ySegments=1] - The number of vertical segments.
   * @param {string} [orientation='xz'] - The orientation of the plane (e.g., 'xz', 'xy', 'yz').
   * @return {PlaneGeometry} A new PlaneGeometry object.
   */
  createPlaneGeometry(
    width: number,
    height: number,
    xSegments: number = 1,
    ySegments: number = 1,
    orientation: string = 'xz'
  ): PlaneGeometry {
    return new PlaneGeometry(this.gl, width, height, xSegments, ySegments, orientation);
  }

  /**
   * Creates a new mesh using the given geometry and material, stores it, and returns the created mesh.
   *
   * @param {PlaneGeometry} geometry - The geometry to define the shape of the mesh.
   * @param {Material} material - The material to define the appearance of the mesh.
   * @return {Mesh} The created mesh instance.
   */
  createMesh(geometry: PlaneGeometry, material: Material): Mesh {
    const mesh = new Mesh(this.gl, geometry, material);
    this.meshes.push(mesh);
    return mesh;
  }
}
