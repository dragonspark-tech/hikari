/**
 * GLSL vertex shader code stored as a template literal string.
 * This shader applies per-pixel color manipulation to render an object with specific visual effects.
 *
 * It includes the following functionality:
 * - Uses `v_color` as the primary varying color for rendering.
 * - Allows optional darkening of the top portion of the object if the `u_darken_top` uniform is set to 1.0.
 * - Darkening is influenced by the fragment's position within the screen space (`gl_FragCoord.xy`)
 *   and a user-defined `u_shadow_power` uniform.
 *
 * Shader uniforms expected:
 * - `u_darken_top` (float): Indicates whether to apply darkening to the top (1.0 to enable, 0.0 to disable).
 * - `u_shadow_power` (float): Controls the intensity of the shadowing effect.
 * - `resolution` (vec2): The resolution of the viewport in pixels (width and height).
 */
export const fragmentShader = `varying vec3 v_color;void main(){vec3 color=v_color;if(u_darken_top==1.0){vec2 st=gl_FragCoord.xy/resolution.xy;color.g-=pow(st.y+sin(-12.0)*st.x,u_shadow_power)*0.4;}gl_FragColor=vec4(color,1.0);}`;
