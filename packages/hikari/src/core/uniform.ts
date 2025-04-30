interface UniformOptions {
  type: string;
  value: any;
  excludeFrom?: string;
  transpose?: boolean;
}

/**
 * Represents a uniform variable in a WebGL shader.
 * Provides configuration details for both properties and methods to handle uniforms, including updating values and generating GLSL declarations.
 */
export class Uniform {
  type: string;
  value: any;
  excludeFrom?: string;
  transpose: boolean = false;
  typeFn: string;

  /**
   * Constructs a new instance of the class with specified options.
   *
   * @param {UniformOptions} options - The configuration options for the instance.
   * @return {void} Initializes the instance with the given options and determines the appropriate uniform function name based on the type.
   */
  constructor(options: UniformOptions) {
    this.type = 'float';

    // Apply options
    Object.assign(this, options);

    // Set the appropriate uniform function name based on type
    this.typeFn =
      {
        float: '1f',
        int: '1i',
        vec2: '2fv',
        vec3: '3fv',
        vec4: '4fv',
        mat4: 'Matrix4fv'
      }[this.type] || '1f';
  }

  /**
   * Updates a WebGL uniform variable with the stored value and type information.
   *
   * @param {WebGLUniformLocation} [location] The location of the uniform variable in the shader program.
   * @param {WebGLRenderingContext} [gl] The WebGL rendering context to perform the operation.
   * @return {void} Does not return a value.
   */
  update(location?: WebGLUniformLocation, gl?: WebGLRenderingContext): void {
    if (this.value !== undefined && location && gl) {
      if (this.typeFn.indexOf('Matrix') === 0) {
        (gl as any)[`uniform${this.typeFn}`](location, this.transpose, this.value);
      } else {
        (gl as any)[`uniform${this.typeFn}`](location, this.value);
      }
    }
  }

  /**
   * Generates the GLSL declaration string for a uniform variable.
   *
   * @param {string} name - The name of the uniform variable.
   * @param {string} type - The shader type for which the declaration is being generated.
   * @param {number} [length=0] - The length for array-type uniforms, defaults to 0 for non-array uniforms.
   * @return {string} The GLSL declaration string for the uniform, or an empty string if the uniform should be excluded.
   */
  getDeclaration(name: string, type: string, length: number = 0): string {
    // Skip if this uniform should be excluded from the current shader type
    if (this.excludeFrom === type) {
      return '';
    }

    // Handle array type
    if (this.type === 'array') {
      return (
        (this.value[0] as Uniform).getDeclaration(name, type, this.value.length) +
        `\nconst int ${name}_length = ${this.value.length};`
      );
    }

    // Handle struct type
    if (this.type === 'struct') {
      let nameNoPrefix = name.replace('u_', '');
      nameNoPrefix = nameNoPrefix.charAt(0).toUpperCase() + nameNoPrefix.slice(1);

      return (
        `uniform struct ${nameNoPrefix} {\n` +
        Object.entries(this.value)
          .map(([fieldName, uniform]) =>
            (uniform as Uniform).getDeclaration(fieldName, type).replace(/^uniform/, '')
          )
          .join('') +
        `\n} ${name}${length > 0 ? `[${length}]` : ''};`
      );
    }

    // Basic uniform declaration
    return `uniform ${this.type} ${name}${length > 0 ? `[${length}]` : ''};`;
  }
}
