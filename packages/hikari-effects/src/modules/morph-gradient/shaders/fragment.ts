
/**
 * A GLSL fragment shader string used for rendering graphics effects.
 *
 * This fragment shader manipulates the color output based on input variables and conditions.
 * It dynamically adjusts colors using a mixing factor, resolution of the canvas,
 * application-specific parameters, and intensity calculation derived from a combination of
 * screen coordinates and sinusoidal functions.
 *
 * Variables used in the shader:
 * - varying vec3 v_color: Input vertex color passed from the vertex shader.
 * - uniform vec2 resolution: The resolution of the rendering surface.
 * - uniform float u_apply_color_mix: A switch controlling whether the color mix effect is applied.
 * - uniform float u_color_mix_power: The exponent to tweak intensity during color manipulation.
 * - uniform vec3 u_color_mix_values: Defines the color adjustments applied during the mix.
 */
export const fragmentShader = `varying vec3 v_color;void main(){vec3 color=v_color;if(u_apply_color_mix==1.0){vec2 st=gl_FragCoord.xy/resolution;float intensity=pow(st.y+sin(-12.0)*st.x,u_color_mix_power);color-=u_color_mix_values*intensity;}gl_FragColor=vec4(color,1.0);}`;

