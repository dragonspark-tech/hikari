import { Uniform } from './uniform';

interface UniformInstance {
  uniform: Uniform;
  location: WebGLUniformLocation;
}

/**
 * Represents a material used in WebGL rendering, which includes compiled shaders,
 * a program, and associated uniforms. The `Material` class handles shader compilation,
 * linking, and attaching uniforms for rendering.
 */
export class Material {
  vertexSource: string;
  fragmentSource: string;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  uniforms: Record<string, Uniform>;
  uniformInstances: UniformInstance[] = [];
  private context: WebGLRenderingContext;

  /**
   * Constructs a WebGL program by compiling vertex and fragment shaders, linking them, and attaching specified uniforms.
   *
   * @param {WebGLRenderingContext} context - The WebGL rendering context used to create shaders and programs.
   * @param {string} vertexShaders - Source code for the vertex shader.
   * @param {string} fragmentShaders - Source code for the fragment shader.
   * @param {Record<string, Uniform>} [uniforms={}] - A record of specific uniforms to attach to the shaders.
   * @param {Record<string, Uniform>} commonUniforms - A record of shared/common uniforms to attach to the shaders.
   * @return {void} This constructor does not return a value.
   */
  constructor(
    context: WebGLRenderingContext,
    vertexShaders: string,
    fragmentShaders: string,
    uniforms: Record<string, Uniform> = {},
    commonUniforms: Record<string, Uniform>
  ) {
    this.context = context;
    this.uniforms = uniforms;

    // Compile shaders
    const prefix = '\n              precision highp float;\n            ';

    // Build vertex shader source
    this.vertexSource = `
      ${prefix}
      attribute vec4 position;
      attribute vec2 uv;
      attribute vec2 uvNorm;
      ${this.getUniformVariableDeclarations(commonUniforms, 'vertex')}
      ${this.getUniformVariableDeclarations(uniforms, 'vertex')}
      ${vertexShaders}
    `;

    // Build fragment shader source
    this.fragmentSource = `
      ${prefix}
      ${this.getUniformVariableDeclarations(commonUniforms, 'fragment')}
      ${this.getUniformVariableDeclarations(uniforms, 'fragment')}
      ${fragmentShaders}
    `;

    // Compile shaders
    this.vertexShader = this.getShaderByType(context.VERTEX_SHADER, this.vertexSource);
    this.fragmentShader = this.getShaderByType(context.FRAGMENT_SHADER, this.fragmentSource);

    // Create and link program
    this.program = context.createProgram() as WebGLProgram;
    context.attachShader(this.program, this.vertexShader);
    context.attachShader(this.program, this.fragmentShader);
    context.linkProgram(this.program);

    // Check for linking errors
    if (!context.getProgramParameter(this.program, context.LINK_STATUS)) {
      console.error(context.getProgramInfoLog(this.program));
    }

    // Use the program and attach uniforms
    context.useProgram(this.program);
    this.attachUniforms(undefined, commonUniforms);
    this.attachUniforms(undefined, uniforms);
  }

  /**
   * Attaches uniforms to the WebGL program, processing arrays, structs, or individual uniform variables.
   *
   * @param {string} [name] - The name of the uniform or the prefix for array or struct uniforms. If undefined, all uniforms in the collection are processed.
   * @param {Uniform | Record<string, Uniform>} [uniforms] - The uniform(s) to attach. May be an individual uniform, an array, or a struct.
   * @return {void} This method does not return any value.
   */
  attachUniforms(name?: string, uniforms?: Uniform | Record<string, Uniform>): void {
    // If name is undefined, process all uniforms in the collection
    if (name === undefined && uniforms !== undefined) {
      Object.entries(uniforms).forEach(([uniformName, uniform]) => {
        this.attachUniforms(uniformName, uniform);
      });
      return;
    }

    // Skip if either name or uniforms is undefined
    if (name === undefined || uniforms === undefined) {
      return;
    }

    // Handle array type uniforms
    if (uniforms.type === 'array') {
      (uniforms.value as Uniform[]).forEach((uniform, i) => {
        this.attachUniforms(`${name}[${i}]`, uniform);
      });
      return;
    }

    // Handle struct type uniforms
    if (uniforms.type === 'struct') {
      Object.entries(uniforms.value).forEach(([field, uniform]) => {
        this.attachUniforms(`${name}.${field}`, uniform as Uniform);
      });
      return;
    }

    // Handle basic uniforms
    this.uniformInstances.push({
      uniform: uniforms as Uniform,
      location: this.context.getUniformLocation(this.program, name) as WebGLUniformLocation
    });
  }

  /**
   * Retrieves and compiles a WebGLShader of a specified type using the provided source code.
   *
   * @param {number} type - The type of the shader to be created (e.g., Vertex or Fragment Shader).
   * @param {string} source - The source code for the shader.
   * @return {WebGLShader} - The compiled WebGLShader object.
   */
  private getShaderByType(type: number, source: string): WebGLShader {
    const shader = this.context.createShader(type) as WebGLShader;

    this.context.shaderSource(shader, source);
    this.context.compileShader(shader);

    // Check for compilation errors
    if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
      console.error(this.context.getShaderInfoLog(shader));
    }

    return shader;
  }

  /**
   * Generates uniform variable declarations by iterating through the provided uniforms.
   *
   * @param {Record<string, Uniform>} uniforms - A record containing uniform*/
  private getUniformVariableDeclarations(uniforms: Record<string, Uniform>, type: string): string {
    return Object.entries(uniforms)
      .map(([name, uniform]) => uniform.getDeclaration(name, type))
      .join('\n');
  }
}
