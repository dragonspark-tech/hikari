/**
 * An object that maps uniform types to their corresponding WebGL uniform function suffixes.
 *
 * The keys of the object represent different GLSL uniform variable types,
 * and the values are strings indicating the suffix used in WebGL's uniform functions.
 *
 * This mapping is helpful when dynamically determining the correct WebGL function
 * to call based on a uniform's type.
 *
 * @constant
 * @property float - Represents a float uniform type, mapped to '1f'.
 * @property int - Represents an int uniform type, mapped to '1i'.
 * @property vec2 - Represents a vec2 uniform type, mapped to '2fv'.
 * @property vec3 - Represents a vec3 uniform type, mapped to '3fv'.
 * @property vec4 - Represents a vec4 uniform type, mapped to '4fv'.
 * @property mat4 - Represents a mat4 uniform type, mapped to 'Matrix4fv'.
 */
export const uniformTypeFns = {
  float: '1f',
  int: '1i',
  vec2: '2fv',
  vec3: '3fv',
  vec4: '4fv',
  mat4: 'Matrix4fv',
  struct: 'struct'
} as const;

export type BasicUniformType = keyof typeof uniformTypeFns;
export type UniformType = BasicUniformType | 'array' | 'struct';

export type UniformValue<T extends UniformType> =
  T extends 'float' | 'int'
    ? number
    : // vectors can be number[] or fixed-length tuples
    T extends 'vec2'
    ? [number, number] | number[]
    : T extends 'vec3'
    ? [number, number, number] | number[]
    : T extends 'vec4'
    ? [number, number, number, number] | number[]
    : // mat4 is usually a Float32Array or number[]
    T extends 'mat4'
    ? Float32Array | number[]
    : // array of uniforms
    T extends 'array'
    ? Uniform<BasicUniformType>[]
    : // struct is a dict of sub-Uniforms
    T extends 'struct'
    ? Record<string, Uniform<BasicUniformType>>
    : // otherwise never
      never;

export interface UniformOptions<T extends UniformType = 'float'> {
  type?: T; // defaulted below
  value: UniformValue<T>;
  excludeFrom?: string;
  transpose?: boolean;
}

/**
 * A class representing a WebGL uniform, which contains metadata and operations for managing uniform
 * variables in WebGL shaders, including their type, value, and other attributes.
 *
 * @template T
 * @extends {UniformType}
 */
export class Uniform<T extends UniformType = 'float'> {
  readonly type: T;
  value: UniformValue<T>;
  readonly excludeFrom?: string;
  readonly transpose: boolean;
  readonly typeFn: string;

  constructor({ type = 'float' as T, value, excludeFrom, transpose = false }: UniformOptions<T>) {
    this.type = type;
    this.value = value;
    this.excludeFrom = excludeFrom;
    this.transpose = transpose;
    this.typeFn = uniformTypeFns[type as BasicUniformType] ?? '1f';
  }

  update(loc?: WebGLUniformLocation, gl?: WebGL2RenderingContext): void {
    if (loc && gl && this.value !== undefined) {
      const fnName = `uniform${this.typeFn}` as keyof WebGL2RenderingContext;
      if (this.typeFn.startsWith('Matrix')) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        (gl as any)[fnName](loc, this.transpose, this.value);
      } else {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        (gl as any)[fnName](loc, this.value);
      }
    }
  }

  getDeclaration(name: string, stage: string, length = 0): string {
    if (this.excludeFrom === stage) return '';

    if (this.type === 'array') {
      const arr = this.value as Uniform<BasicUniformType>[];
      return (
        arr[0].getDeclaration(name, stage, arr.length) +
        `\nconst int ${name}_length = ${arr.length};`
      );
    }

    if (this.type === 'struct') {
      const structName = name.replace(/^u_/, '').replace(/^./, (s) => s.toUpperCase());

      const entries = Object.entries(this.value as Record<string, Uniform<BasicUniformType>>) as [
        string,
        Uniform<BasicUniformType>
      ][];

      const body = entries
        .map(([f, u]) => u.getDeclaration(f, stage).replace(/^uniform\s*/, ''))
        .join('');

      return `uniform struct ${structName} {\n${body}\n} ${name}${
        length > 0 ? `[${length}]` : ''
      };`;
    }

    return `uniform ${this.type} ${name}${length > 0 ? `[${length}]` : ''};`;
  }
}
