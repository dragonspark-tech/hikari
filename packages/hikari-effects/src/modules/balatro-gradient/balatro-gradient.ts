import { vertex } from './shaders/vertex';
import { fragment } from './shaders/fragment';
import {
  HikariGL,
  Material,
  Mesh,
  PlaneGeometry,
  Uniform,
  type UniformType
} from '@dragonspark/hikari';

/**
 * Interface for the uniforms used in the Balatro gradient effect
 */
interface BalatroGradientUniforms {
  u_time: Uniform<'float'>;
  u_spinRotation: Uniform<'float'>;
  u_spinSpeed: Uniform<'float'>;
  u_offset: Uniform<'vec2'>;
  u_color1: Uniform<'vec4'>;
  u_color2: Uniform<'vec4'>;
  u_color3: Uniform<'vec4'>;
  u_contrast: Uniform<'float'>;
  u_lighting: Uniform<'float'>;
  u_spinAmount: Uniform<'float'>;
  u_pixelFilter: Uniform<'float'>;
  u_spinEase: Uniform<'float'>;
  u_isRotate: Uniform<'bool'>;
  u_mouse: Uniform<'vec2'>;

  [key: string]: Uniform<UniformType>;
}

/**
 * Configuration options for the Balatro gradient effect
 */
export interface BalatroGradientConfig {
  wireframe: boolean;
  playing: boolean;
  density: [number, number],
}

/**
 * Options for initializing the Balatro gradient effect
 */
export interface BalatroGradientOptions {
  selector: string;
  spinRotation?: number;
  spinSpeed?: number;
  offset?: [number, number];
  color1?: string; // HEX e.g., "#DE443B"
  color2?: string; // HEX e.g., "#006BB4"
  color3?: string; // HEX e.g., "#162325"
  contrast?: number;
  lighting?: number;
  spinAmount?: number;
  pixelFilter?: number;
  spinEase?: number;
  isRotate?: boolean;
  mouseInteraction?: boolean;
  maxFrameTimeStep?: number;
  debug?: boolean;
  density?: [number, number];
}

/**
 * Converts a hex color string to a vec4 array
 * @param hex Hex color string (e.g., "#DE443B")
 * @returns RGBA values as [r, g, b, a] in range [0, 1]
 */
function hexToVec4(hex: string): [number, number, number, number] {
  const hexStr = hex.replace("#", "");
  let r = 0,
    g = 0,
    b = 0,
    a = 1;
  if (hexStr.length === 6) {
    r = parseInt(hexStr.slice(0, 2), 16) / 255;
    g = parseInt(hexStr.slice(2, 4), 16) / 255;
    b = parseInt(hexStr.slice(4, 6), 16) / 255;
  } else if (hexStr.length === 8) {
    r = parseInt(hexStr.slice(0, 2), 16) / 255;
    g = parseInt(hexStr.slice(2, 4), 16) / 255;
    b = parseInt(hexStr.slice(4, 6), 16) / 255;
    a = parseInt(hexStr.slice(6, 8), 16) / 255;
  }
  return [r, g, b, a];
}

/**
 * Implementation of the Balatro gradient effect for Hikari
 */
export class BalatroGradient {
  // DOM element
  canvasElement: HTMLCanvasElement | null = null;

  // CSS variable handling
  isLoadedClass = false;

  // Gradient properties
  isScrolling = false;
  scrollingTimeout: number | undefined;
  scrollingRefreshDelay = 200;
  isIntersecting = false;

  // Canvas style
  computedCanvasStyle: CSSStyleDeclaration | null = null;

  // Configuration
  conf: BalatroGradientConfig;

  // Uniforms for WebGL
  uniforms: BalatroGradientUniforms | undefined;

  // Animation properties
  t = 0;
  last = 0;
  maxFrameTimeStep = 60;

  // Canvas dimensions
  width: number = window.innerWidth;
  height = 600;

  // Mesh properties
  xSegCount = 0;
  ySegCount = 0;
  mesh!: Mesh;
  material!: Material | null;
  geometry!: PlaneGeometry;

  // WebGL
  hikari: HikariGL | null = null;

  // Effect properties
  spinRotation = -2.0;
  spinSpeed = 7.0;
  offset: [number, number] = [0.0, 0.0];
  color1 = "#DE443B";
  color2 = "#006BB4";
  color3 = "#162325";
  contrast = 3.5;
  lighting = 0.4;
  spinAmount = 0.25;
  pixelFilter = 2000;
  spinEase = 1.0;
  isRotate = false;
  mouseInteraction = true;

  // Mouse position
  mousePosition: [number, number] = [0.5, 0.5];

  // Debug
  debug = false;

  /**
   * Constructor for initializing a BalatroGradient instance with optional configuration options.
   *
   * @param {Partial<BalatroGradientOptions>} [options] - A partial configuration object to customize the behavior.
   */
  constructor(options?: Partial<BalatroGradientOptions>) {
    // Initialize configuration
    this.conf = {
      wireframe: false,
      playing: true,
      density: [0.01, 0.01] // Use much lower density for fewer segments
    };

    // Apply options if provided
    if (options) {
      if (options.spinRotation !== undefined) this.spinRotation = options.spinRotation;
      if (options.spinSpeed !== undefined) this.spinSpeed = options.spinSpeed;
      if (options.offset !== undefined) this.offset = options.offset;
      if (options.color1 !== undefined) this.color1 = options.color1;
      if (options.color2 !== undefined) this.color2 = options.color2;
      if (options.color3 !== undefined) this.color3 = options.color3;
      if (options.contrast !== undefined) this.contrast = options.contrast;
      if (options.lighting !== undefined) this.lighting = options.lighting;
      if (options.spinAmount !== undefined) this.spinAmount = options.spinAmount;
      if (options.pixelFilter !== undefined) this.pixelFilter = options.pixelFilter;
      if (options.spinEase !== undefined) this.spinEase = options.spinEase;
      if (options.isRotate !== undefined) this.isRotate = options.isRotate;
      if (options.mouseInteraction !== undefined) this.mouseInteraction = options.mouseInteraction;
      if (options.maxFrameTimeStep !== undefined) this.maxFrameTimeStep = options.maxFrameTimeStep;
      if (options.density !== undefined) this.conf.density = options.density;
      if (options.debug !== undefined) this.debug = options.debug;

      // Initialize gradient if the selector is provided
      if (options.selector) {
        this.initGradient(options.selector).then((r) =>
          this.debug ? console.log('BalatroGradient initialized', r) : () => void 0
        );
      }
    }
  }

  /**
   * Handles the scroll event by managing the scrolling state and timeout.
   */
  handleScroll = (): void => {
    clearTimeout(this.scrollingTimeout);
    this.scrollingTimeout = window.setTimeout(this.handleScrollEnd, this.scrollingRefreshDelay);

    if (this.conf.playing && !this.isScrolling && !this.isIntersecting) {
      this.isScrolling = true;
      this.pause();
    }
  };

  /**
   * Handles the end of a scroll event.
   */
  handleScrollEnd = (): void => {
    this.isScrolling = false;
    if (this.isIntersecting) {
      this.play();
    }
  };

  /**
   * Updates the graphical and structural properties upon a resize event.
   */
  resize = (): void => {
    if (!this.hikari) return;

    this.width = window.innerWidth;

    if (this.debug) {
      console.log('Resizing to:', this.width, this.height);
    }

    this.hikari.setSize(this.width, this.height);

    this.applyTransformations();

    // Keep fixed segment counts (don't recalculate based on density)
    this.xSegCount = 1;
    this.ySegCount = 1;

    if (this.debug) {
      console.log('Using fixed segments:', this.xSegCount, this.ySegCount);
    }

    this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount);
    this.mesh.geometry.setSize(this.width, this.height);

    this.mesh.wireframe = this.conf.wireframe;

    if (this.debug) {
      console.log('Resize complete, wireframe:', this.conf.wireframe);
    }
  };

  applyTransformations = (): void => {
    if (!this.hikari) return;

    // Set up the basic orthographic camera
    this.hikari.setOrthographicCamera();

    // Get the current projection matrix (no need to modify it for now)
    // If we need to apply zoom or rotation later, we can follow the MorphGradient pattern

    if (this.debug) {
      console.log('Applied orthographic camera transformation');
      console.log('Projection matrix:', this.hikari.commonUniforms.projectionMatrix.value);
    }
  };

  /**
   * Determines whether the current frame should be skipped.
   */
  shouldSkipFrame(timestamp: number): boolean {
    return window.document.hidden || !this.conf.playing || undefined === timestamp;
  }

  /**
   * Handles the animation loop for rendering and updating visuals.
   */
  animate = (timestamp: number): void => {
    if (!this.hikari) return;
    if (this.shouldSkipFrame(timestamp)) return;

    // Compute delta since last frame
    const delta = timestamp - this.last;

    // Advance the time uniform
    this.t +=
      this.maxFrameTimeStep === 0
        ? delta
        : Math.min(timestamp - this.last, 1000 / this.maxFrameTimeStep);
    this.last = timestamp;

    // Update shader and render
    if (this.uniforms) {
      this.uniforms.u_time.value = this.t * 0.001; // Convert to seconds

      if (this.debug && timestamp % 1000 < 20) { // Log only occasionally to avoid flooding
        console.log('Animation frame:', timestamp);
        console.log('Time uniform:', this.uniforms.u_time.value);
        console.log('Mouse position:', this.uniforms.u_mouse.value);
      }
    }

    this.hikari.render();

    // Queue up next frame
    if (this.conf.playing) {
      requestAnimationFrame(this.animate);
    }
  };

  /**
   * Adds the 'isLoaded' class to the element and its parent element.
   */
  addIsLoadedClass = (): void => {
    if (!this.canvasElement) return;

    if (!this.isLoadedClass) {
      this.isLoadedClass = true;
      this.canvasElement.classList.add('isLoaded');

      setTimeout(() => {
        if (this.canvasElement && this.canvasElement.parentElement) {
          this.canvasElement.parentElement.classList.add('isLoaded');
        }
      }, 3000);
    }
  };

  /**
   * Pauses the animation.
   */
  pause = (): void => {
    this.conf.playing = false;
  };

  /**
   * Starts the animation.
   */
  play = (): void => {
    requestAnimationFrame(this.animate);
    this.conf.playing = true;
  };

  /**
   * Initializes the gradient by selecting a canvas element specified by the selector.
   */
  initGradient = async (selector: string): Promise<BalatroGradient> => {
    this.canvasElement = document.querySelector(selector) as HTMLCanvasElement;
    if (this.canvasElement) {
      await this.connect();
    }
    return this;
  };

  /**
   * Establishes a connection and sets up event listeners.
   */
  async connect(): Promise<void> {
    if (!this.canvasElement) return;

    // Check if canvas exists
    if (document.querySelectorAll('canvas').length < 1) {
      console.log('DID NOT LOAD GRADIENT CANVAS');
      return;
    }

    // Initialize HikariGL
    this.hikari = new HikariGL({
      canvas: this.canvasElement,
      debug: this.debug
    });

    // Get computed style
    requestAnimationFrame(() => {
      if (!this.canvasElement) return;

      this.computedCanvasStyle = getComputedStyle(this.canvasElement);
      this.init();
    });

    window.addEventListener('scroll', this.handleScroll);
    this.isIntersecting = true;
    this.addIsLoadedClass();
    this.play();

    if (this.mouseInteraction && this.canvasElement) {
      this.canvasElement.addEventListener('mousemove', this.handleMouseMove);
    }
  }

  /**
   * Handles mouse movement events.
   */
  handleMouseMove = (e: MouseEvent): void => {
    if (!this.canvasElement || !this.mouseInteraction) return;

    const rect = this.canvasElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    this.mousePosition = [x, y];

    // Update mouse uniform if available
    if (this.uniforms) {
      this.uniforms.u_mouse.value = this.mousePosition;
    }
  };

  /**
   * Disconnects event listeners and updates the status of the instance.
   */
  disconnect() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.resize);

    if (this.canvasElement && this.mouseInteraction) {
      this.canvasElement.removeEventListener('mousemove', this.handleMouseMove);
    }

    this.isIntersecting = false;
    this.conf.playing = false;
  }

  /**
   * Initialize the material for the gradient
   */
  initMaterial(): Material | null {
    if (!this.hikari) return null;

    // Create uniforms
    this.uniforms = {
      u_time: this.hikari.createUniform({
        value: 0,
        type: 'float',
        excludeFrom: 'vertex'
      }),
      u_spinRotation: this.hikari.createUniform({
        value: this.spinRotation,
        type: 'float',
        excludeFrom: 'vertex'
      }),
      u_spinSpeed: this.hikari.createUniform({
        value: this.spinSpeed,
        type: 'float',
        excludeFrom: 'vertex'
      }),
      u_offset: this.hikari.createUniform({
        value: this.offset,
        type: 'vec2',
        excludeFrom: 'vertex'
      }),
      u_color1: this.hikari.createUniform({
        value: hexToVec4(this.color1),
        type: 'vec4',
        excludeFrom: 'vertex'
      }),
      u_color2: this.hikari.createUniform({
        value: hexToVec4(this.color2),
        type: 'vec4',
        excludeFrom: 'vertex'
      }),
      u_color3: this.hikari.createUniform({
        value: hexToVec4(this.color3),
        type: 'vec4',
        excludeFrom: 'vertex'
      }),
      u_contrast: this.hikari.createUniform({
        value: this.contrast,
        type: 'float',
        excludeFrom: 'vertex'
      }),
      u_lighting: this.hikari.createUniform({
        value: this.lighting,
        type: 'float',
        excludeFrom: 'vertex'
      }),
      u_spinAmount: this.hikari.createUniform({
        value: this.spinAmount,
        type: 'float',
        excludeFrom: 'vertex'
      }),
      u_pixelFilter: this.hikari.createUniform({
        value: this.pixelFilter,
        type: 'float',
        excludeFrom: 'vertex'
      }),
      u_spinEase: this.hikari.createUniform({
        value: this.spinEase,
        type: 'float',
        excludeFrom: 'vertex'
      }),
      u_isRotate: this.hikari.createUniform({
        value: this.isRotate,
        type: 'bool',
        excludeFrom: 'vertex'
      }),
      u_mouse: this.hikari.createUniform({
        value: this.mousePosition,
        type: 'vec2',
        excludeFrom: 'vertex'
      })
    };

    // Create the material
    return this.hikari.createMaterial(vertex, fragment, this.uniforms);
  }

  /**
   * Initialize the mesh
   */
  initMesh(): void {
    if (!this.hikari) return;

    this.material = this.initMaterial();
    if (!this.material) return;

    // Use fixed segment counts (1,1) to create a simple quad (2 triangles)
    // This is closer to the original Triangle implementation
    this.xSegCount = 1;
    this.ySegCount = 1;

    if (this.debug) {
      console.log('Creating geometry with dimensions:', this.width, this.height, 'segments:', this.xSegCount, this.ySegCount);
    }

    this.geometry = this.hikari.createPlaneGeometry(this.width, this.height, this.xSegCount, this.ySegCount, 'xy');

    this.mesh = this.hikari.createMesh(this.geometry, this.material);
    this.mesh.wireframe = this.conf.wireframe;

    if (this.debug) {
      console.log('Mesh created with wireframe:', this.conf.wireframe);
    }
  }

  /**
   * Initialize the gradient
   */
  init(): void {
    this.initMesh();
    this.applyTransformations();
    this.resize();
    requestAnimationFrame(this.animate);
    window.addEventListener('resize', this.resize);
  }

  /**
   * Set the spin rotation
   */
  setSpinRotation(spinRotation: number): void {
    this.spinRotation = spinRotation;
    if (this.uniforms) {
      this.uniforms.u_spinRotation.value = spinRotation;
    }
  }

  /**
   * Set the spin speed
   */
  setSpinSpeed(spinSpeed: number): void {
    this.spinSpeed = spinSpeed;
    if (this.uniforms) {
      this.uniforms.u_spinSpeed.value = spinSpeed;
    }
  }

  /**
   * Set the offset
   */
  setOffset(offset: [number, number]): void {
    this.offset = offset;
    if (this.uniforms) {
      this.uniforms.u_offset.value = offset;
    }
  }

  /**
   * Set color 1
   */
  setColor1(color: string): void {
    this.color1 = color;
    if (this.uniforms) {
      this.uniforms.u_color1.value = hexToVec4(color);
    }
  }

  /**
   * Set color 2
   */
  setColor2(color: string): void {
    this.color2 = color;
    if (this.uniforms) {
      this.uniforms.u_color2.value = hexToVec4(color);
    }
  }

  /**
   * Set color 3
   */
  setColor3(color: string): void {
    this.color3 = color;
    if (this.uniforms) {
      this.uniforms.u_color3.value = hexToVec4(color);
    }
  }

  /**
   * Set contrast
   */
  setContrast(contrast: number): void {
    this.contrast = contrast;
    if (this.uniforms) {
      this.uniforms.u_contrast.value = contrast;
    }
  }

  /**
   * Set lighting
   */
  setLighting(lighting: number): void {
    this.lighting = lighting;
    if (this.uniforms) {
      this.uniforms.u_lighting.value = lighting;
    }
  }

  /**
   * Set spin amount
   */
  setSpinAmount(spinAmount: number): void {
    this.spinAmount = spinAmount;
    if (this.uniforms) {
      this.uniforms.u_spinAmount.value = spinAmount;
    }
  }

  /**
   * Set pixel filter
   */
  setPixelFilter(pixelFilter: number): void {
    this.pixelFilter = pixelFilter;
    if (this.uniforms) {
      this.uniforms.u_pixelFilter.value = pixelFilter;
    }
  }

  /**
   * Set spin ease
   */
  setSpinEase(spinEase: number): void {
    this.spinEase = spinEase;
    if (this.uniforms) {
      this.uniforms.u_spinEase.value = spinEase;
    }
  }

  /**
   * Set rotation mode
   */
  setIsRotate(isRotate: boolean): void {
    this.isRotate = isRotate;
    if (this.uniforms) {
      this.uniforms.u_isRotate.value = isRotate;
    }
  }

  /**
   * Enable or disable mouse interaction
   */
  setMouseInteraction(enabled: boolean): void {
    if (this.mouseInteraction === enabled) return;

    this.mouseInteraction = enabled;

    if (this.canvasElement) {
      if (enabled) {
        this.canvasElement.addEventListener('mousemove', this.handleMouseMove);
      } else {
        this.canvasElement.removeEventListener('mousemove', this.handleMouseMove);
        // Reset mouse position to center
        this.mousePosition = [0.5, 0.5];
        if (this.uniforms) {
          this.uniforms.u_mouse.value = this.mousePosition;
        }
      }
    }
  }

  /**
   * Set the density of the mesh
   * @param density Density as [x, y] values
   */
  setDensity(density: [number, number]): void {
    this.conf.density = density;
    if (this.hikari) {
      this.xSegCount = Math.ceil(this.width * this.conf.density[0]);
      this.ySegCount = Math.ceil(this.height * this.conf.density[1]);
      this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount);
    }
  }
}
