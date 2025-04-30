import { Attribute } from './attribute';

interface GeometryAttributes {
  position: Attribute;
  uv: Attribute;
  uvNorm: Attribute;
  index: Attribute;
}

/**
 * Represents a plane geometry used for rendering in WebGL.
 * Provides methods for defining the topology and size of the plane,
 * including the number of segments and orientation.
 */
export class PlaneGeometry {
  attributes: GeometryAttributes;
  width!: number;
  height!: number;
  orientation!: string;
  xSegCount!: number;
  ySegCount!: number;
  vertexCount!: number;
  quadCount!: number;

  /**
   * Constructs a new instance and initializes attributes and topology for rendering in WebGL.
   *
   * @param {WebGLRenderingContext} context - The WebGL rendering context.
   * @param {number} width - The width of the grid or object being rendered.
   * @param {number} height - The height of the grid or object being rendered.
   * @param {number} [xSegments=1] - The number of segments along the x-axis.
   * @param {number} [ySegments=1] - The number of segments along the y-axis.
   * @param {string} [orientation='xz'] - The orientation of the grid or object ('xz', 'xy', etc.).
   * @return {void} No return value.
   */
  constructor(
    context: WebGLRenderingContext,
    width: number,
    height: number,
    xSegments: number = 1,
    ySegments: number = 1,
    orientation: string = 'xz'
  ) {
    // Create attributes
    this.attributes = {
      position: new Attribute(context, {
        target: context.ARRAY_BUFFER,
        size: 3
      }),
      uv: new Attribute(context, {
        target: context.ARRAY_BUFFER,
        size: 2
      }),
      uvNorm: new Attribute(context, {
        target: context.ARRAY_BUFFER,
        size: 2
      }),
      index: new Attribute(context, {
        target: context.ELEMENT_ARRAY_BUFFER,
        size: 3,
        type: context.UNSIGNED_SHORT
      })
    };

    // Set topology and size
    this.setTopology(xSegments, ySegments);
    this.setSize(width, height, orientation);
  }

  /**
   * Configures the topology of a grid by specifying the number of segments in both the X and Y directions.
   * Updates vertex, UV, and index data to define the geometry.
   *
   * @param {number} [xSegments=1] - The number of segments along the X-axis of the grid.
   * @param {number} [ySegments=1] - The number of segments along the Y-axis of the grid.
   * @return {void} This method does not return a value.
   */
  setTopology(xSegments: number = 1, ySegments: number = 1): void {
    this.xSegCount = xSegments;
    this.ySegCount = ySegments;

    // Calculate counts
    this.vertexCount = (this.xSegCount + 1) * (this.ySegCount + 1);
    this.quadCount = this.xSegCount * this.ySegCount * 2;

    // Create attribute arrays
    this.attributes.uv.values = new Float32Array(2 * this.vertexCount);
    this.attributes.uvNorm.values = new Float32Array(2 * this.vertexCount);
    this.attributes.index.values = new Uint16Array(3 * this.quadCount);

    // Generate UV coordinates and indices
    for (let y = 0; y <= this.ySegCount; y++) {
      for (let x = 0; x <= this.xSegCount; x++) {
        const vertexIndex = y * (this.xSegCount + 1) + x;

        // UV coordinates (0 to 1)
        this.attributes.uv.values![2 * vertexIndex] = x / this.xSegCount;
        this.attributes.uv.values![2 * vertexIndex + 1] = 1 - y / this.ySegCount;

        // Normalized UV coordinates (-1 to 1)
        this.attributes.uvNorm.values![2 * vertexIndex] = (x / this.xSegCount) * 2 - 1;
        this.attributes.uvNorm.values![2 * vertexIndex + 1] = 1 - (y / this.ySegCount) * 2;

        // Generate indices for triangles
        if (x < this.xSegCount && y < this.ySegCount) {
          const quadIndex = y * this.xSegCount + x;

          // First triangle
          this.attributes.index.values![6 * quadIndex] = vertexIndex;
          this.attributes.index.values![6 * quadIndex + 1] = vertexIndex + 1 + this.xSegCount;
          this.attributes.index.values![6 * quadIndex + 2] = vertexIndex + 1;

          // Second triangle
          this.attributes.index.values![6 * quadIndex + 3] = vertexIndex + 1;
          this.attributes.index.values![6 * quadIndex + 4] = vertexIndex + 1 + this.xSegCount;
          this.attributes.index.values![6 * quadIndex + 5] = vertexIndex + 2 + this.xSegCount;
        }
      }
    }

    // Update buffers
    this.attributes.uv.update();
    this.attributes.uvNorm.update();
    this.attributes.index.update();
  }

  /**
   * Sets the size of the object and adjusts its orientation.
   * Updates vertex positions to reflect the specified dimensions and orientation.
   *
   * @param {number} [width=1] - The width of the object.
   * @param {number} [height=1] - The height of the object.
   * @param {string} [orientation='xz'] - The orientation plane of the object.
   *                                      It must be a combination of two axes ('xy', 'xz', or 'yz').
   * @return {void} This method does not return a value.
   */
  setSize(width: number = 1, height: number = 1, orientation: string = 'xz'): void {
    this.width = width;
    this.height = height;
    this.orientation = orientation;

    // Create position array if it doesn't exist or has wrong size
    if (
      !this.attributes.position.values ||
      this.attributes.position.values.length !== 3 * this.vertexCount
    ) {
      this.attributes.position.values = new Float32Array(3 * this.vertexCount);
    }

    const halfWidth = width / -2;
    const halfHeight = height / -2;
    const segmentWidth = width / this.xSegCount;
    const segmentHeight = height / this.ySegCount;

    // Generate vertex positions
    for (let y = 0; y <= this.ySegCount; y++) {
      const yPos = halfHeight + y * segmentHeight;

      for (let x = 0; x <= this.xSegCount; x++) {
        const xPos = halfWidth + x * segmentWidth;
        const vertexIndex = y * (this.xSegCount + 1) + x;

        // Set position based on orientation
        const posArray = this.attributes.position.values!;
        posArray[3 * vertexIndex + 'xyz'.indexOf(orientation[0])] = xPos;
        posArray[3 * vertexIndex + 'xyz'.indexOf(orientation[1])] = -yPos;
      }
    }

    // Update position buffer
    this.attributes.position.update();
  }
}
