import { Uniform, UniformType } from './uniform';

type AnyUniform = Uniform<UniformType>;

interface UniformInstance {
  uniform: AnyUniform;
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
  uniforms: Record<string, AnyUniform>;
  uniformInstances: UniformInstance[] = [];
  private readonly context: WebGL2RenderingContext;

  /**
   * Constructor for initializing a WebGL shader program with specified shaders and uniforms.
   *
   * @param context - The WebGL2 rendering context used to create and manage the program.
   * @param vertexShaders - The source code for the vertex shader.
   * @param fragmentShaders - The source code for the fragment shader.
   * @param [uniforms={}] - Optional record of uniform variables specific to this program.
   * @param commonUniforms - Record of uniform variables common across shaders.
   */
  constructor(
    context: WebGL2RenderingContext,
    vertexShaders: string,
    fragmentShaders: string,
    uniforms: Record<string, AnyUniform> = {},
    commonUniforms: Record<string, AnyUniform>
  ) {
    this.context = context;
    this.uniforms = uniforms;

    // Compile shaders
    const prefix = '\n              precision highp float;\n            ';

    // Build the vertex shader source
    this.vertexSource = `
      ${prefix}
      attribute vec4 position;
      attribute vec2 uv;
      attribute vec2 uvNorm;
      ${this.getUniformVariableDeclarations(commonUniforms, 'vertex')}
      ${this.getUniformVariableDeclarations(uniforms, 'vertex')}
      ${vertexShaders}
    `;

    // Build the fragment shader source
    this.fragmentSource = `
      ${prefix}
      ${this.getUniformVariableDeclarations(commonUniforms, 'fragment')}
      ${this.getUniformVariableDeclarations(uniforms, 'fragment')}
      ${fragmentShaders}
    `;

    // Compile & link
    this.vertexShader = this.getShaderByType(context.VERTEX_SHADER, this.vertexSource);
    this.fragmentShader = this.getShaderByType(context.FRAGMENT_SHADER, this.fragmentSource);
    this.program = context.createProgram() as WebGLProgram;
    context.attachShader(this.program, this.vertexShader);
    context.attachShader(this.program, this.fragmentShader);
    context.linkProgram(this.program);

    if (!context.getProgramParameter(this.program, context.LINK_STATUS)) {
      console.error(context.getProgramInfoLog(this.program));
    }

    // Attach uniforms
    context.useProgram(this.program);
    this.attachUniforms(undefined, commonUniforms);
    this.attachUniforms(undefined, uniforms);
  }

  /**
   * Attaches uniform variables to the current WebGL program.
   * This method processes and maps uniform values, arrays,
   * or structures to their corresponding locations in the shader program.
   *
   * @param [name] - The name of the uniform or the base name for uniform arrays and structs.
   * If undefined, all uniforms from the provided object will be processed.
   * @param [uniforms] - The uniform or collection of uniforms to attach.
   * It can be a single uniform value, an array of uniforms, or a struct containing multiple uniforms.
   */
  attachUniforms(name?: string, uniforms?: AnyUniform | Record<string, AnyUniform>): void {
    if (!uniforms) return;

    if (name === undefined) {
      Object.entries(uniforms as Record<string, AnyUniform>).forEach(([key, u]) =>
        this.attachUniforms(key, u)
      );
      return;
    }

    const uni = uniforms as AnyUniform;

    if (uni.type === 'array') {
      (uni.value as AnyUniform[]).forEach((u, i) => this.attachUniforms(`${name}[${i}]`, u));
      return;
    }

    if (uni.type === 'struct') {
      Object.entries(uni.value as Record<string, AnyUniform>).forEach(([field, u]) =>
        this.attachUniforms(`${name}.${field}`, u)
      );
      return;
    }

    const uniformLocation = this.context.getUniformLocation(this.program, name);
    if (uniformLocation) {
      this.uniformInstances.push({
        uniform: uni,
        location: uniformLocation
      });
    }
  }

  /**
   * Compiles and returns a WebGL shader of the specified type using the provided source code.
   *
   * @param type - The type of shader to be created (e.g., `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`).
   * @param source - The GLSL source code for the shader.
   * @return The compiled shader object.
   */
  private getShaderByType(type: number, source: string): WebGLShader {
    const gl = this.context;
    const shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  /**
   * Generates uniform variable declarations for a given set of uniforms and shader stage.
   *
   * @param uniforms - An object representing uniform variables,
   *                   where the key is the uniform name and the value is an instance of AnyUniform.
   * @param shaderStage - The shader stage (e.g., "vertex" or "fragment") for which the uniform declarations are being generated.
   * @return A concatenated string of uniform variable declarations, formatted for the specified shader stage.
   */
  private getUniformVariableDeclarations(
    uniforms: Record<string, AnyUniform>,
    shaderStage: string
  ): string {
    return Object.entries(uniforms)
      .map(([name, u]) => u.getDeclaration(name, shaderStage))
      .filter((line) => line.length > 0)
      .join('\n');
  }
}
