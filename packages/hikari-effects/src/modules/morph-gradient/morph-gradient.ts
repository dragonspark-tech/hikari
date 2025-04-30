import { vertexShader } from '../../shaders/vertex';
import { fragmentShader } from '../../shaders/fragment';
import { noiseShader } from '../../shaders/noise';
import { blendShader } from '../../shaders/blend';
import { HikariGL } from '@dragonspark/hikari';
import { normalizeColor } from '../../utils/colors';

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
  colors?: string[];
  amplitude?: number;
  seed?: number;
  freqX?: number;
  freqY?: number;
  freqDelta?: number;
  darkenTop?: boolean;
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

  // Canvas style
  computedCanvasStyle: CSSStyleDeclaration | null = null;

  // Configuration
  conf: MorphGradientConfig;

  // Uniforms for WebGL
  uniforms: Record<string, any> = {};

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
  mesh: any;
  material: any;
  geometry: any;

  // WebGL
  hikari: HikariGL | null = null;

  // Scroll observer
  scrollObserver: any = null;

  // Wave properties
  amp: number = 320;
  seed: number = 5;
  freqX: number = 14e-5;
  freqY: number = 29e-5;
  freqDelta: number = 1e-5;

  // Active colors
  activeColors: number[] = [1, 1, 1, 1];

  // UI state
  isMetaKey: boolean = false;
  isGradientLegendVisible: boolean = false;
  isMouseDown: boolean = false;

  /**
   * Create a new Gradient
   * @param options Gradient options
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
      density: [0.04, 0.1], // Reduced density for better performance
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

      // Initialize gradient if selector is provided
      if (options.selector) {
        this.initGradient(options.selector);
      }
    }
  }

  /**
   * Handle scroll events
   */
  handleScroll = (): void => {
    clearTimeout(this.scrollingTimeout);
    this.scrollingTimeout = window.setTimeout(this.handleScrollEnd, this.scrollingRefreshDelay);

    if (this.isGradientLegendVisible) {
      this.hideGradientLegend();
    }

    if (this.conf.playing) {
      this.isScrolling = true;
      this.pause();
    }
  };

  /**
   * Handle scroll end events
   */
  handleScrollEnd = (): void => {
    this.isScrolling = false;
    if (this.isIntersecting) {
      this.play();
    }
  };

  /**
   * Handle window resize
   */
  resize = (): void => {
    if (!this.hikari) return;

    this.width = window.innerWidth;
    this.hikari.setSize(this.width, this.height);
    this.hikari.setOrthographicCamera();

    this.xSegCount = Math.ceil(this.width * this.conf.density[0]);
    this.ySegCount = Math.ceil(this.height * this.conf.density[1]);

    this.mesh.geometry.setTopology(this.xSegCount, this.ySegCount);
    this.mesh.geometry.setSize(this.width, this.height);

    const shadowPower = this.width < 600 ? 5 : 6;
    this.mesh.material.uniforms.u_shadow_power.value = shadowPower;
  };

  /**
   * Handle mouse down events
   */
  handleMouseDown = (e: MouseEvent): void => {
    if (this.isGradientLegendVisible) {
      this.isMetaKey = e.metaKey;
      this.isMouseDown = true;

      if (this.conf.playing === false) {
        requestAnimationFrame(this.animate);
      }
    }
  };

  /**
   * Handle mouse up events
   */
  handleMouseUp = (): void => {
    this.isMouseDown = false;
  };

  /**
   * Handle key down events
   */
  handleKeyDown = (_: KeyboardEvent): void => {
    // This was empty in the original code
    // Could be used for keyboard shortcuts
  };

  /**
   * Check if a frame should be skipped
   * @param timestamp Animation timestamp
   * @returns Whether the frame should be skipped
   */
  shouldSkipFrame(timestamp: number): boolean {
    return (
      !!window.document.hidden ||
      !this.conf.playing ||
      undefined === timestamp
    );
  }

  /**
   * Animate the gradient
   */
  animate = (timestamp: number): void => {
    if (!this.hikari) return;

    if (!this.shouldSkipFrame(timestamp) || this.isMouseDown) {
      this.t += Math.min(timestamp - this.last, 1000 / 60);
      this.last = timestamp;

      if (this.isMouseDown) {
        let delta = 160;
        if (this.isMetaKey) {
          delta = -160;
        }
        this.t += delta;
      }

      this.mesh.material.uniforms.u_time.value = this.t;
      this.hikari.render();
    }

    if (this.last !== 0 && this.isStatic()) {
      this.hikari.render();
      this.disconnect();
      return;
    }

    if (this.conf.playing || this.isMouseDown) {
      requestAnimationFrame(this.animate);
    }
  };

  /**
   * Check if animation should be static
   */
  isStatic(): boolean {
    // In the original code, this was checking a global setting
    // For now, we'll just return false
    return false;
  }

  /**
   * Add loaded class to the element
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
   * Pause the animation
   */
  pause = (): void => {
    this.conf.playing = false;
  };

  /**
   * Play the animation
   */
  play = (): void => {
    requestAnimationFrame(this.animate);
    this.conf.playing = true;
  };

  /**
   * Initialize the gradient
   * @param selector CSS selector for the canvas element
   * @returns This gradient instance
   */
  initGradient = (selector: string): MorphGradient => {
    this.el = document.querySelector(selector) as HTMLCanvasElement;
    if (this.el) {
      this.connect();
    }
    return this;
  };

  /**
   * Connect to the DOM and initialize WebGL
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

    // In the original code, there was a scroll observer setup here
    // For simplicity, we'll just add event listeners directly
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('keydown', this.handleKeyDown);
    this.isIntersecting = true;
    this.addIsLoadedClass();
    this.play();
  }

  /**
   * Disconnect from the DOM and clean up
   */
  disconnect(): void {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('resize', this.resize);

    this.isIntersecting = false;
    this.conf.playing = false;
  }

  /**
   * Wait for CSS variables to be available
   */
  waitForCssVars(): void {
    if (!this.computedCanvasStyle) return;

    if (this.computedCanvasStyle.getPropertyValue('--gradient-color-1').indexOf('#') !== -1) {
      this.init();
      this.addIsLoadedClass();
    } else {
      this.cssVarRetries += 1;
      if (this.cssVarRetries > this.maxCssVarRetries) {
        this.sectionColors = [
          [1, 0, 0], // red
          [1, 0, 0], // red
          [1, 0, 1], // magenta
          [0, 1, 0], // green
          [0, 0, 1] // blue
        ];
        this.init();
        return;
      }

      requestAnimationFrame(() => this.waitForCssVars());
    }
  }

  /**
   * Initialize the gradient colors from CSS variables
   */
  initGradientColors(): void {
    if (!this.computedCanvasStyle) return;

    this.sectionColors = [
      '--gradient-color-1',
      '--gradient-color-2',
      '--gradient-color-3',
      '--gradient-color-4'
    ]
      .map((cssPropertyName) => {
        let hex = this.computedCanvasStyle!.getPropertyValue(cssPropertyName).trim();

        // Check if shorthand hex value was used and double the length
        if (hex.length === 4) {
          const hexTemp = hex
            .substr(1)
            .split('')
            .map((hexChar) => hexChar + hexChar)
            .join('');
          hex = `#${hexTemp}`;
        }

        return hex && `0x${hex.substr(1)}`;
      })
      .filter(Boolean)
      .map((hex) => normalizeColor(parseInt(hex as string, 16)));
  }

  /**
   * Initialize the material for the gradient
   */
  initMaterial(): any {
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
        value: this.el && this.el.dataset.jsDarkenTop === '' ? 1 : 0
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
    this.mesh = this.hikari.createMesh(this.geometry, this.material);
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
   * Show the gradient legend
   */
  showGradientLegend(): void {
    if (this.width > this.minWidth) {
      this.isGradientLegendVisible = true;
      document.body.classList.add('isGradientLegendVisible');
    }
  }

  /**
   * Hide the gradient legend
   */
  hideGradientLegend(): void {
    this.isGradientLegendVisible = false;
    document.body.classList.remove('isGradientLegendVisible');
  }
}