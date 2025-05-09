/**
 * Vertex shader for the Balatro gradient effect.
 * 
 * This is a simple vertex shader that passes UV coordinates to the fragment shader.
 * It doesn't perform any vertex deformation or color calculations.
 */
// export const vertex = `
// varying vec2 vUv;
// void main() {
//     vec3 pos = vec3(
//         position.x,
//         position.y,
//         position.z
//     );
//
//   vUv = uv;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
// }
// `;

export const vertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
}
`;