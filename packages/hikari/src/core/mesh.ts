import { Attribute } from './attribute';
import { PlaneGeometry } from './plane-geometry';
import { Material } from './material';

interface AttributeInstance {
  attribute: Attribute;
  location: number;
}

/**
 * Represents a drawable mesh object in WebGL, composed of geometry and material.
 * Provides functionality to render the mesh using WebGL.
 */
export class Mesh {
  geometry: PlaneGeometry;
  material: Material;
  wireframe = false;
  attributeInstances: AttributeInstance[] = [];
  private readonly context: WebGLRenderingContext;

  /**
   * Creates an instance of the class to handle rendering of a plane geometry with a specified material in a WebGL context.
   *
   * @param {WebGLRenderingContext} context - The WebGL context used for rendering.
   * @param {PlaneGeometry} geometry - The geometry data describing the plane.
   * @param {Material} material - The material providing shaders and rendering properties for the geometry.
   */
  constructor(context: WebGLRenderingContext, geometry: PlaneGeometry, material: Material) {
    this.context = context;
    this.geometry = geometry;
    this.material = material;

    // Create attribute instances
    Object.entries(this.geometry.attributes).forEach(([name, attribute]) => {
      this.attributeInstances.push({
        attribute,
        location: attribute.attach(name, this.material.program)
      });
    });
  }

  /**
   * Renders the object's geometry using the associated WebGL context, material, and attributes.
   *
   * This method sets up the shader program, updates uniform variables, binds attribute buffers,
   * and executes the draw call to render the object's geometry on the screen.
   *
   * @return {void}
   */
  draw(): void {
    // Use the shader program
    this.context.useProgram(this.material.program);

    // Update uniforms
    this.material.uniformInstances.forEach(({ uniform, location }) => {
      uniform.update(location, this.context);
    });

    // Bind attributes
    this.attributeInstances.forEach(({ attribute, location }) => {
      attribute.use(location);
    });

    if (this.geometry.attributes.index.values) {
      // Draw elements
      if (this.wireframe) {
        // Set line width
        this.context.lineWidth(1.5);

        // Use GL_LINES mode with the existing indices
        // This will draw the edges of each triangle
        this.context.drawElements(
          this.context.LINES,
          this.geometry.attributes.index.values.length,
          this.context.UNSIGNED_SHORT,
          0
        );
      } else {
        // Draw triangles normally
        this.context.drawElements(
          this.context.TRIANGLES,
          this.geometry.attributes.index.values.length,
          this.context.UNSIGNED_SHORT,
          0
        );
      }
    }
  }
}
