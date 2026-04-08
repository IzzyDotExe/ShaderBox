export const defaultVertexShader = `uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(pos.x * 5.0 + uTime) * 0.1;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

export const defaultFragmentShader = `uniform float uTime;
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(vUv.x, vUv.y, (sin(uTime) + 1.0) / 2.0, 1.0);
}`;
