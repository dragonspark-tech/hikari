import { vertexShader } from '../../shaders/vertex';
import { fragmentShader } from '../../shaders/fragment';
import { noiseShader } from '../../shaders/noise';
import { blendShader } from '../../shaders/blend';
import { normalizeColor } from '../../utils/colors';
import { HikariGL, Mesh, Material, PlaneGeometry, Uniform } from '@dragonspark/hikari';

interface ShaderFiles {
  vertex: string;
  fragment: string;
  noise: string;
  blend: string;
}

export interface MorphGradientConfig {
  presetName: string;
  wireframe: boolean;
  density: [number, number];
  zoom: number;
  rotation: number;
  playing: boolean;
}

export interface MorphGradientOptions {
  selector: string;
  baseColor?: string;
  waveColors?: string[];
  amplitude?: number;
  seed?: number;
  freqX?: number;
  freqY?: number;
  freqDelta?: number;
  darkenTop?: boolean;
  wireframe?: boolean;
  zoom?: number;
  rotation?: number;
  density?: [number, number];
}

export class MorphGradient {
  // DOM element
  el: HTMLCanvasElement | null = null;

  // CSS variable handling
  cssVarRetries: number = 0;
  maxCssVarRetries: number = 200;

  // Gradient properties
  angle: number = 0;
  isLoadedClass: boolean = false;
  isScrolling: boolean = false;
  scrollingTimeout: number | undefined;
  scrollingRefreshDelay: number = 200;
  isIntersecting: boolean = false;

  // Shader files
  shaderFiles: ShaderFiles;

  // Colors
  sectionColors: [number, number, number][] = [];
  optionBaseColor: string | null = null;
  optionWaveColors: string[] | null = null;
  defaultBaseColor: string = '#a960ee';
  defaultWaveColors: string[] = ['#ff333d', '#90e0ff', '#ffcb57'];

  // Canvas style
  computedCanvasStyle: CSSStyleDeclaration | null = null;

  // Configuration
  conf: MorphGradientConfig;

  // Uniforms for WebGL
  uniforms: Record<string, Uniform> = {};

  // Animation properties
  t: number = 1253106;
  last: number = 0;

  // Canvas dimensions
  width: number = window.innerWidth;
  minWidth: number = 1111;
  height: number = 600;

  // Mesh properties
  xSegCount: number = 0;
  ySegCount: number = 0;
  mesh!: Mesh;
  material!: Material | null;
  geometry!: PlaneGeometry;

  // WebGL
  hikari: HikariGL | null = null;

  // Wave properties
  amp: number = 320;
  seed: number = 5;
  freqX: number = 14e-5;
  freqY: number = 29e-5;
  freqDelta: number = 1e-5;
  darkenTop?: boolean = true;

  // Active colors
  activeColors: number[] = [1, 1, 1, 1];

  /**
   * Constructor for initializing a MorphGradient instance with optional configuration options.
   *
   * @param {Partial<MorphGradientOptions>} [options] - A partial configuration object to customize the behavior of the MorphGradient instance.
   * @param {number} [options.amplitude] - The amplitude value for the gradient effect.
   * @param {number} [options.seed] - The random seed value for gradient calculations.
   * @param {number} [options.freqX] - The frequency value along the X axis.
   * @param {number} [options.freqY] - The frequency value along the Y axis.
   * @param {number} [options.freqDelta] - The frequency delta value for gradient transitions.
   * @param {string} [options.baseColor] - The base color for the gradient.
   * @param {Array<string>} [options.waveColors] - An array of colors for the gradient waves.
   * @param {string} [options.selector] - A selector to identify the HTML element where the gradient will be initialized.
   *
   * @return A new instance of the MorphGradient class with the specified or default configurations.
   */
  constructor(options?: Partial<MorphGradientOptions>) {
    // Initialize shader files
    this.shaderFiles = {
      vertex: vertexShader,
      fragment: fragmentShader,
      noise: noiseShader,
      blend: blendShader
    };

    // Initialize configuration
    this.conf = {
      presetName: '',
      wireframe: false,
      density: [0.06, 0.16],
      zoom: 1,
      rotation: 0,
      playing: true
    };

    // Apply options if provided
    if (options) {
      if (options.amplitude !== undefined) this.amp = options.amplitude;
      if (options.seed !== undefined) this.seed = options.seed;
      if (options.freqX !== undefined) this.freqX = options.freqX;
      if (options.freqY !== undefined) this.freqY = options.freqY;
      if (options.freqDelta !== undefined) this.freqDelta = options.freqDelta;
      if (options.darkenTop !== undefined) this.darkenTop = options.darkenTop;

      // Handle color options
      if (options.baseColor !== undefined) this.optionBaseColor = options.baseColor;
      if (options.waveColors !== undefined) this.optionWaveColors = options.waveColors;

      // Apply configuration options
      if (options.wireframe !== undefined) this.conf.wireframe = options.wireframe;
      if (options.zoom !== undefined) this.conf.zoom = options.zoom;
      if (options.rotation !== undefined) this.conf.rotation = options.rotation;
      if (options.density !== undefined) this.conf.density = options.density;

      // Initialize gradient if the selector is provided
      if (options.selector) {
        this.initGradient(options.selector);
      }
    }
  }

  /**
   * Handles the scroll event by managing the scrolling state and timeout.
   * Clears any existing scrolling timeout, sets a new timeout to trigger actions when scrolling ends,
   * and performs specific logic like pausing playback if certain conditions are met.
   *
   * This function is used to optimize actions during scroll events,
   * avoid redundant executions, and maintain the desired application behavior.
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
   * A method that is invoked to handle the end of a scroll event.
   *
   * This method stops the scrolling state by setting `isScrolling` to false.
   * Additionally, it checks if the current view is intersecting, and if so,
   * triggers the `play()` method to resume or start playback or actions associated with the element.
   */
  handleScrollEnd = (): void => {
    this.isScrolling = false;
    if (this.isIntersecting) {
      this.play();
    }
  };

  /**
   * Updates the graphical and structural properties of the application upon a resize event.
   * This method adjusts the dimensions of the rendering area, recalculates segment counts,
   * updates camera settings, geometry topology, and material properties based on the new width and height.
   */
  resize = (): void => {
    if (!this.hikari) return;

    this.width = window.innerWidth;
    this.hikari.setSize(this.width, this.height);

    // Apply zoom and rotation transformations
    this.applyTransformations();

    this.xSegCount = Math.ceil(this.width * this.conf.density[0]);
    this.ySegCount = Math.ceil(this.height * this.conf.density[1]);

    this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount);
    this.mesh.geometry.setSize(this.width, this.height);

    this.mesh.material.uniforms.u_shadow_power.value = this.width < 600 ? 5 : 6;
    this.mesh.wireframe = this.conf.wireframe;
  };

  /**
   * Applies transformations, including zoom and rotation, to the current orthographic camera's projection matrix.
   *
   * This method adjusts the camera's projection matrix based on the configured zoom level and rotation angle:
   * - Adjusts the zoom by scaling the matrix values while ensuring a minimum safe zoom level.
   * - Applies a 2D rotation transformation to the matrix based on the specified rotation angle in degrees.
   *
   * Preconditions:
   * - The `hikari` instance must be available.
   *
   * Effects:
   * - Modifies the `projectionMatrix` within `hikari.commonUniforms` to reflect the applied transformations.
   *
   * Note:
   * - Prevents zoom level from becoming too small to avoid extreme blurriness.
   */
  applyTransformations = (): void => {
    if (!this.hikari) return;

    // Set up the basic orthographic camera
    this.hikari.setOrthographicCamera();

    // Get the current projection matrix
    const matrix = [...this.hikari.commonUniforms.projectionMatrix.value];

    // Apply zoom by scaling the matrix
    if (this.conf.zoom !== 1) {
      // Ensure zoom is not too small to prevent extreme blurriness
      const safeZoom = Math.max(0.5, this.conf.zoom);
      matrix[0] *= safeZoom; // Scale X
      matrix[5] *= safeZoom; // Scale Y
    }

    // Apply rotation by modifying the matrix
    if (this.conf.rotation !== 0) {
      const rotationRad = this.conf.rotation * Math.PI / 180; // Convert degrees to radians
      const cosTheta = Math.cos(rotationRad);
      const sinTheta = Math.sin(rotationRad);

      // Store original values
      const m0 = matrix[0];
      const m1 = matrix[1];
      const m4 = matrix[4];
      const m5 = matrix[5];

      // Apply rotation to the matrix (2D rotation)
      matrix[0] = m0 * cosTheta - m1 * sinTheta;
      matrix[1] = m0 * sinTheta + m1 * cosTheta;
      matrix[4] = m4 * cosTheta - m5 * sinTheta;
      matrix[5] = m4 * sinTheta + m5 * cosTheta;
    }

    // Update the projection matrix
    this.hikari.commonUniforms.projectionMatrix.value = matrix;
  };

  /**
   * Determines whether the current frame should be skipped based on the provided timestamp and certain conditions.
   *
   * @param {number} timestamp - The timestamp of the current frame to be evaluated.
   * @return {boolean} Returns true if the frame should be skipped, otherwise false.
   */
  shouldSkipFrame(timestamp: number): boolean {
    return window.document.hidden || !this.conf.playing || undefined === timestamp;
  }

  /**
   * Handles the animation loop for rendering and updating visuals.
   *
   * This method is invoked repeatedly to animate the scene based on
   * the provided timestamp. It calculates the time delta since the
   * last frame, updates time-based uniforms, and advances the scene
   * rendering. It also factors in user interactions, such as mouse
   * activity, for time manipulation.
   *
   * Behavior:
   * - If the necessary rendering context (`this.hikari`) is not available, the animation stops.
   * - Skips frame processing if certain conditions are met, determined by `this.shouldSkipFrame(timestamp)`.
   * - Initializes the last recorded timestamp if it is the first animation frame.
   * - Computes the time delta between frames and updates the primary time variable.
   * - Updates shader properties and renders the scene using the provided `hikari` renderer.
   * - Stops the animation loop if the scene becomes static (`this.isStatic()`).
   * - Schedules the next animation frame if the application is in a playing state or user interaction is ongoing.
   *
   * @param {number} timestamp - The current time in milliseconds, typically provided by the browser's requestAnimationFrame.
   * @returns {void}
   */
  animate = (timestamp: number): void => {
    if (!this.hikari) return;
    if (this.shouldSkipFrame(timestamp)) return;

    // initialize last timestamp on first frame
    if (this.last === 0) {
      this.last = timestamp;
    }

    // compute full delta since last frame
    const delta = timestamp - this.last;
    this.last = timestamp;

    // advance the time uniform by the full true delta
    this.t += delta;

    // update shader and render
    this.mesh.material.uniforms.u_time.value = this.t;
    this.hikari.render();

    // if we’re done static, bail out
    if (this.isStatic()) {
      this.disconnect();
      return;
    }

    // queue up next frame at *actual* refresh rate
    if (this.conf.playing) {
      requestAnimationFrame(this.animate);
    }
  };

  /**
   * Determines if the current context is static.
   *
   * @return {boolean} Returns true if the context is static, otherwise false.
   */
  isStatic(): boolean {
    return false;
  }

  /**
   * Adds the 'isLoaded' class to the element and its parent element.
   *
   * The method checks if the `el` property exists and whether the `isLoadedClass` flag
   * is not already set. If the conditions are met, it adds the 'isLoaded' class to the
   * `el` element and sets the `isLoadedClass` flag to `true`. After a delay of 3 seconds,
   * the 'isLoaded' class is also added to the parent element of `el` if it exists.
   *
   * @returns {void}
   */
  addIsLoadedClass = (): void => {
    if (!this.el) return;

    if (!this.isLoadedClass) {
      this.isLoadedClass = true;
      this.el.classList.add('isLoaded');

      setTimeout(() => {
        if (this.el && this.el.parentElement) {
          this.el.parentElement.classList.add('isLoaded');
        }
      }, 3000);
    }
  };

  /**
   * Pauses the current operation or playback by setting the `playing` property to `false`.
   *
   * Modifies the internal state of the configuration to indicate that the operation or playback
   * has been paused.
   */
  pause = (): void => {
    this.conf.playing = false;
  };

  /**
   * Starts the play mode by initiating the animation loop and setting the playing state to true.
   *
   * This method uses the `requestAnimationFrame` function to begin the animation process,
   * invoking the `animate` function. Additionally, it updates the internal `playing` configuration
   * property to reflect that the play mode is active.
   *
   * @function
   * @returns {void} Does not return a value.
   */
  play = (): void => {
    requestAnimationFrame(this.animate);
    this.conf.playing = true;
  };

  /**
   * Initializes the gradient by selecting a canvas element specified by the selector,
   * connects it to the required resources, and returns the instance.
   *
   * @param {string} selector - A string representing the selector of the HTML canvas element.
   * @returns {Promise<MorphGradient>} A promise that resolves to the current instance of the MorphGradient.
   */
  initGradient = async (selector: string): Promise<MorphGradient> => {
    this.el = document.querySelector(selector) as HTMLCanvasElement;
    if (this.el) {
      await this.connect();
    }
    return this;
  };

  /**
   * Establishes a connection and sets up event listeners for interacting with the canvas element.
   * Initializes graphics rendering using HikariGL. Ensures that required resources are present
   * before proceeding and applies necessary styles. It also manages user interaction events
   * such as scrolling, mouse actions, and keyboard input.
   *
   * @return {Promise<void>} A promise indicating the completion of the connection initialization process.
   */
  async connect(): Promise<void> {
    if (!this.el) return;

    // Check if canvas exists
    if (document.querySelectorAll('canvas').length < 1) {
      console.log('DID NOT LOAD GRADIENT CANVAS');
      return;
    }

    // Initialize MiniGl
    this.hikari = new HikariGL({
      canvas: this.el,
      debug: false
    });

    // Get computed style
    requestAnimationFrame(() => {
      if (!this.el) return;

      this.computedCanvasStyle = getComputedStyle(this.el);
      this.waitForCssVars();
    });

    window.addEventListener('scroll', this.handleScroll);
    this.isIntersecting = true;
    this.addIsLoadedClass();
    this.play();
  }

  /**
   * Disconnects event listeners and updates the status of the instance.
   * The method removes the scroll and resize event listeners from the window,
   * sets the intersection state to false, and updates the playing configuration.
   */
  disconnect() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.resize);

    this.isIntersecting = false;
    this.conf.playing = false;
  }

  /**
   * Waits for the CSS variables to be computed and applies necessary initialization.
   * Ensures that computed canvas styles are present before proceeding, then initializes
   * required properties and adds a predefined class indicating that the process is complete.
   *
   * @return {void} Does not return a value.
   */
  waitForCssVars(): void {
    if (!this.computedCanvasStyle) return;

    this.init();
    this.addIsLoadedClass();
  }

  /**
   * Parse a color string which could be a CSS variable or direct color value
   * @param color Color string to parse
   * @returns Parsed color value or null if parsing failed
   */
  parseColor(color: string): string | null {
    if (!color) return null;

    // Check if it's a CSS variable in the format "--variable-name"
    if (color.startsWith('--') && this.computedCanvasStyle) {
      const cssValue = this.computedCanvasStyle.getPropertyValue(color).trim();
      if (cssValue) {
        return cssValue;
      }
      return null;
    }

    // Check if it's a CSS variable in the format "var(--variable-name)"
    if (color.startsWith('var(') && this.computedCanvasStyle) {
      // Extract the variable name from var(--variable-name)
      const varMatch = color.match(/var\((--[^,)]+)(?:,\s*([^)]+))?\)/);
      if (varMatch && varMatch[1]) {
        const cssVarName = varMatch[1];
        const cssValue = this.computedCanvasStyle.getPropertyValue(cssVarName).trim();

        // If we have a value, return it
        if (cssValue) {
          return cssValue;
        }

        // If we have a fallback value in the var() function, use it
        if (varMatch[2]) {
          return this.parseColor(varMatch[2]); // Recursively parse the fallback value
        }

        return null;
      }
    }

    // It's a direct color value
    return color;
  }

  /**
   * Process a hex color string to ensure it's in the correct format
   * @param hex Hex color string
   * @returns Processed hex string or null if invalid
   */
  processHexColor(hex: string): string | null {
    if (!hex || !hex.startsWith('#')) return null;

    // Check if shorthand hex value was used and double the length
    if (hex.length === 4) {
      const hexTemp = hex
        .substring(1)
        .split('')
        .map((hexChar) => hexChar + hexChar)
        .join('');
      hex = `#${hexTemp}`;
    }

    return hex && `0x${hex.substring(1)}`;
  }

  /**
   * Initialize the gradient colors from options, CSS variables, or defaults
   */
  initGradientColors(): void {
    let baseColorSource: string | null;
    let waveColorSources: string[];

    // Handle base color
    if (this.optionBaseColor) {
      baseColorSource = this.optionBaseColor;
    } else {
      baseColorSource = this.defaultBaseColor;
    }

    // Handle wave colors
    if (this.optionWaveColors && this.optionWaveColors.length > 0) {
      waveColorSources = this.optionWaveColors;
    } else {
      waveColorSources = this.defaultWaveColors;
    }

    // Process base color
    let processedBaseColor: [number, number, number] | null = null;
    if (baseColorSource) {
      const parsedColor = this.parseColor(baseColorSource);
      const hexColor = parsedColor
        ? this.processHexColor(parsedColor)
        : this.processHexColor(this.defaultBaseColor);
      if (hexColor) {
        processedBaseColor = normalizeColor(parseInt(hexColor, 16));
      }
    }

    // Process wave colors
    const processedWaveColors = waveColorSources
      .map((color) => this.parseColor(color))
      .map((color, index) => {
        // If parsing failed or color is invalid, use default
        if (!color) {
          return this.defaultWaveColors[index % this.defaultWaveColors.length];
        }
        return color;
      })
      .map((hex) => this.processHexColor(hex))
      .filter(Boolean)
      .map((hex) => normalizeColor(parseInt(hex as string, 16)));

    // Combine base color and wave colors
    this.sectionColors = processedBaseColor
      ? [processedBaseColor, ...processedWaveColors]
      : processedWaveColors;

    // Ensure we have at least one wave color
    if (this.sectionColors.length < 2) {
      const defaultWaveColor = this.processHexColor(this.defaultWaveColors[0]);
      if (defaultWaveColor) {
        this.sectionColors.push(normalizeColor(parseInt(defaultWaveColor, 16)));
      }
    }
  }

  /**
   * Initialize the material for the gradient
   */
  initMaterial(): Material | null {
    if (!this.hikari) return null;

    // Create uniforms
    this.uniforms = {
      u_time: this.hikari.createUniform({
        value: 0
      }),
      u_shadow_power: this.hikari.createUniform({
        value: 5
      }),
      u_darken_top: this.hikari.createUniform({
        value: this.darkenTop ? 1 : 0
      }),
      u_active_colors: this.hikari.createUniform({
        value: this.activeColors,
        type: 'vec4'
      }),
      u_global: this.hikari.createUniform({
        value: {
          noiseFreq: this.hikari.createUniform({
            value: [this.freqX, this.freqY],
            type: 'vec2'
          }),
          noiseSpeed: this.hikari.createUniform({
            value: 5e-6
          })
        },
        type: 'struct'
      }),
      u_vertDeform: this.hikari.createUniform({
        value: {
          incline: this.hikari.createUniform({
            value: Math.sin(this.angle) / Math.cos(this.angle)
          }),
          offsetTop: this.hikari.createUniform({
            value: -0.5
          }),
          offsetBottom: this.hikari.createUniform({
            value: -0.5
          }),
          noiseFreq: this.hikari.createUniform({
            value: [3, 4],
            type: 'vec2'
          }),
          noiseAmp: this.hikari.createUniform({
            value: this.amp
          }),
          noiseSpeed: this.hikari.createUniform({
            value: 10
          }),
          noiseFlow: this.hikari.createUniform({
            value: 3
          }),
          noiseSeed: this.hikari.createUniform({
            value: this.seed
          })
        },
        type: 'struct',
        excludeFrom: 'fragment'
      }),
      u_baseColor: this.hikari.createUniform({
        value: this.sectionColors[0],
        type: 'vec3',
        excludeFrom: 'fragment'
      }),
      u_waveLayers: this.hikari.createUniform({
        value: [],
        excludeFrom: 'fragment',
        type: 'array'
      })
    };

    // Add wave layers
    for (let i = 1; i < this.sectionColors.length; i++) {
      this.uniforms.u_waveLayers.value.push(
        this.hikari.createUniform({
          value: {
            color: this.hikari.createUniform({
              value: this.sectionColors[i],
              type: 'vec3'
            }),
            noiseFreq: this.hikari.createUniform({
              value: [2 + i / this.sectionColors.length, 3 + i / this.sectionColors.length],
              type: 'vec2'
            }),
            noiseSpeed: this.hikari.createUniform({
              value: 11 + 0.3 * i
            }),
            noiseFlow: this.hikari.createUniform({
              value: 6.5 + 0.3 * i
            }),
            noiseSeed: this.hikari.createUniform({
              value: this.seed + 10 * i
            }),
            noiseFloor: this.hikari.createUniform({
              value: 0.1
            }),
            noiseCeil: this.hikari.createUniform({
              value: 0.63 + 0.07 * i
            })
          },
          type: 'struct'
        })
      );
    }

    // Create the material
    const vertexShader = [
      this.shaderFiles.noise,
      this.shaderFiles.blend,
      this.shaderFiles.vertex
    ].join('\n\n');

    return this.hikari.createMaterial(vertexShader, this.shaderFiles.fragment, this.uniforms);
  }

  /**
   * Initialize the mesh
   */
  initMesh(): void {
    if (!this.hikari) return;

    this.material = this.initMaterial();
    this.geometry = this.hikari.createPlaneGeometry(
      this.width,
      this.height,
      this.xSegCount,
      this.ySegCount
    );
    this.mesh = this.hikari.createMesh(this.geometry, this.material!);
    this.mesh.wireframe = this.conf.wireframe;
  }

  /**
   * Initialize the gradient
   */
  init(): void {
    this.initGradientColors();
    this.initMesh();
    this.resize();
    requestAnimationFrame(this.animate);
    window.addEventListener('resize', this.resize);
  }

  /**
   * Update the frequency of the gradient
   * @param delta Frequency delta
   */
  updateFrequency(delta: number): void {
    this.freqX += delta;
    this.freqY += delta;
  }

  /**
   * Toggle a color in the gradient
   * @param index Color index
   */
  toggleColor(index: number): void {
    this.activeColors[index] = this.activeColors[index] === 0 ? 1 : 0;
  }

  /**
   * Sets the zoom level for the current configuration and applies the necessary transformations.
   *
   * @param {number} zoom - The desired zoom level to be set.
   */
  setZoom(zoom: number): void {
    this.conf.zoom = zoom;
    this.applyTransformations();
  }

  /**
   * Set the rotation angle
   * @param rotation Rotation angle in degrees
   */
  setRotation(rotation: number): void {
    this.conf.rotation = rotation;
    this.applyTransformations();
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
