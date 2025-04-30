/**
 * GLSL vertex shader code stored as a template literal string.
 * This shader is responsible for manipulating vertex positions and passing interpolated
 * data (like colors) to the fragment shader.
 *
 * Features:
 * - Computes vertex positions including tilt, incline, and noise-based deformation.
 * - Generates procedural noise for vertex manipulation.
 * - Applies specific deformation parameters like noise amplitude and frequency.
 * - Smoothly blends between specified color layers depending on calculated noise.
 * - Incorporates edge fade-out for noise contributions.
 *
 * Key Variables and Concepts:
 * - `u_time`: Provides the animation timeline for procedural effects.
 * - `resolution`: Dimensions of the rendering area used for scaling effects.
 * - `uvNorm`: Normalized texture coordinates used for calculating noise and tilt.
 * - `u_global`: Contains global parameters for noise speed and frequency.
 * - `u_vertDeform`: Contains parameters for vertex deformation, including incline,
 *   noise amplitude, frequency, and offsets.
 * - `noise`: Generated using procedural simplex noise.
 * - `u_active_colors`: Array used to control layer-specific color activations.
 * - `u_waveLayers`: Defines configuration for multiple wave layers, their noise profiles,
 *   and associated colors.
 * - `v_color`: Interpolated vertex color passed to the fragment shader.
 * - `gl_Position`: Final transformed vertex position in clip space.
 *
 * Operations:
 * - Uses mathematical operations to tilt and deform vertices.
 * - Calculates noise based on the time and input coordinates.
 * - Blends colors for active wave layers, weighted by noise intensity.
 */
export const vertexShader = `varying vec3 v_color;

void main() {
  float time = u_time * u_global.noiseSpeed;

  vec2 noiseCoord = resolution * uvNorm * u_global.noiseFreq;

  vec2 st = 1. - uvNorm.xy;

  //
  // Tilting the plane
  //

  // Front-to-back tilt
  float tilt = resolution.y / 2.0 * uvNorm.y;

  // Left-to-right angle
  float incline = resolution.x * uvNorm.x / 2.0 * u_vertDeform.incline;

  // Up-down shift to offset incline
  float offset = resolution.x / 2.0 * u_vertDeform.incline * mix(u_vertDeform.offsetBottom, u_vertDeform.offsetTop, uv.y);

  //
  // Vertex noise
  //

  float noise = snoise(vec3(
    noiseCoord.x * u_vertDeform.noiseFreq.x + time * u_vertDeform.noiseFlow,
    noiseCoord.y * u_vertDeform.noiseFreq.y,
    time * u_vertDeform.noiseSpeed + u_vertDeform.noiseSeed
  )) * u_vertDeform.noiseAmp;

  // Fade noise to zero at edges
  noise *= 1.0 - pow(abs(uvNorm.y), 2.0);

  // Clamp to 0
  noise = max(0.0, noise);

  vec3 pos = vec3(
    position.x,
    position.y + tilt + incline + noise - offset,
    position.z
  );

  //
  // Vertex color, to be passed to fragment shader
  //

  if (u_active_colors[0] == 1.) {
    v_color = u_baseColor;
  }

  for (int i = 0; i < u_waveLayers_length; i++) {
    if (u_active_colors[i + 1] == 1.) {
      WaveLayers layer = u_waveLayers[i];

      float noise = smoothstep(
        layer.noiseFloor,
        layer.noiseCeil,
        snoise(vec3(
          noiseCoord.x * layer.noiseFreq.x + time * layer.noiseFlow,
          noiseCoord.y * layer.noiseFreq.y,
          time * layer.noiseSpeed + layer.noiseSeed
        )) / 2.0 + 0.5
      );

      v_color = blendNormal(v_color, layer.color, pow(noise, 4.));
    }
  }

  //
  // Finish
  //

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;
