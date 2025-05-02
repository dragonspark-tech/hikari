export interface AttributeOptions {
  target: number;
  size: number;
  type?: number;
  normalized?: boolean;
  buffer?: WebGLBuffer;
  values?: Float32Array | Uint16Array;
}

/**
 * Represents a WebGL attribute used for rendering.
 * Manages a WebGL buffer and provides methods to update, attach, and use the attribute in rendering.
 */
export class Attribute {
  type: number;
  normalized: boolean;
  buffer: WebGLBuffer;
  target: number;
  size: number;
  values?: Float32Array | Uint16Array;
  private context: WebGL2RenderingContext;

  /**
   * Creates an instance of a WebGL attribute handler with the given context and options.
   *
   * @param context - The WebGL rendering context used to manage this attribute.
   * @param options - Configuration options for the attribute, such as target and size.
   */
  constructor(context: WebGL2RenderingContext, options: AttributeOptions) {
    this.context = context;
    this.type = context.FLOAT;
    this.normalized = false;
    this.buffer = context.createBuffer() as WebGLBuffer;

    // Apply options
    this.target = options.target;
    this.size = options.size;
    Object.assign(this, options);

    // Initialize the attribute
    this.update();
  }

  /**
   * Updates the buffer data in the WebGL context with the current values.
   * If the `values` property is defined, this method binds the buffer to the specified target
   * and uploads the data to the buffer using WebGL's `STATIC_DRAW` usage pattern.
   */
  update(): void {
    if (this.values !== undefined) {
      this.context.bindBuffer(this.target, this.buffer);
      this.context.bufferData(this.target, this.values, this.context.STATIC_DRAW);
    }
  }

  /**
   * Attaches a shader attribute to the WebGL context and enables its vertex attribute pointer.
   *
   * @param {string} name - The name of the attribute to attach.
   * @param {WebGLProgram} program - The WebGL program containing the attribute.
   * @return {number} The location of the attached attribute in the WebGL program.
   */
  attach(name: string, program: WebGLProgram): number {
    const location = this.context.getAttribLocation(program, name);

    if (this.target === this.context.ARRAY_BUFFER) {
      this.context.enableVertexAttribArray(location);
      this.context.vertexAttribPointer(location, this.size, this.type, this.normalized, 0, 0);
    }

    return location;
  }

  /**
   * Binds the buffer to its specified target and configures the vertex attributes if the target is ARRAY_BUFFER.
   *
   * @param {number} location - The location of the attribute in the WebGL program. Used when configuring vertex attributes.
   * @return {void} This method does not return a value.
   */
  use(location: number): void {
    this.context.bindBuffer(this.target, this.buffer);

    if (this.target === this.context.ARRAY_BUFFER) {
      this.context.enableVertexAttribArray(location);
      this.context.vertexAttribPointer(location, this.size, this.type, this.normalized, 0, 0);
    }
  }
}
