export const defaultVertexShader = `uniform float uTime;
uniform float uDelta;
uniform vec3  uRotation;
uniform vec2  uMouse;

varying vec2  vUv;
varying vec3  vNormal;
varying vec3  vWorldPosition;
varying vec3  vLocalPosition;
varying float vGlitch;

float hash11(float p){ return fract(sin(p * 127.1) * 43758.5453123); }

void main(){
  vUv = uv;
  vNormal = normal;
  vLocalPosition = position;

  vec3 pos = position;

  // --- Glitch: jitter horizontal slices on a stepped clock ---
  float clk   = floor(uTime * 10.0);
  float slice = floor(pos.y * 12.0);
  float r     = hash11(slice + clk * 7.0);
  float doGlitch = step(0.85, r);                 // only some slices glitch
  float amt = hash11(slice * 3.3 + clk) - 0.5;
  // uMouse.x scales glitch intensity; uDelta adds a tiny per-frame jitter
  float intensity = 0.25 + uMouse.x * 0.5 + uDelta * 2.0;
  pos.x += doGlitch * amt * intensity;

  // Subtle breathing pump driven by time + the mesh's live rotation
  pos += normal * sin(uTime * 2.0 + uRotation.y) * 0.02;

  vGlitch = doGlitch;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}`;

export const defaultFragmentShader = `uniform float uTime;
uniform float uDelta;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform mat4  uViewMatrix;
uniform mat4  uProjectionMatrix;
uniform mat3  uNormalMatrix;
uniform vec3  uLightDirection;
uniform vec3  uLightColor;
uniform vec3  uCameraPosition;
uniform vec3  uRotation;

varying vec2  vUv;
varying vec3  vNormal;
varying vec3  vWorldPosition;
varying vec3  vLocalPosition;
varying float vGlitch;

// neon cyberpunk palette
const vec3 NEON_PINK = vec3(1.0, 0.10, 0.55);
const vec3 NEON_CYAN = vec3(0.10, 0.95, 1.0);
const vec3 NEON_PURP = vec3(0.55, 0.20, 1.0);

// glowing grid lines on a set of coordinates (no derivatives needed)
float gridGlow(vec2 p, float scale, float width){
  vec2 g = abs(fract(p * scale) - 0.5);
  float d = min(g.x, g.y);
  return smoothstep(width, 0.0, d);
}

void main(){
  vec3 N = normalize(uNormalMatrix * vNormal);
  vec3 V = normalize(uCameraPosition - vWorldPosition);
  vec3 L = normalize(-uLightDirection);
  vec3 H = normalize(L + V);

  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 96.0);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);

  // --- Neon Tron grid mapped in local space, scrolling with time ---
  vec2 gcoord = vLocalPosition.xy * 2.0 + vec2(0.0, uTime * 0.3);
  float grid = gridGlow(gcoord, 6.0, 0.04);
  grid += 0.5 * gridGlow(vUv, 24.0, 0.03);   // finer secondary grid

  // Energy pulse running along Y
  float pulse = 0.5 + 0.5 * sin(vLocalPosition.y * 8.0 - uTime * 4.0);

  // Pick neon hue by rotation + mouse so spinning shifts the palette
  float hue = 0.5 + 0.5 * sin(uTime * 0.4 + uRotation.y + uMouse.x * 3.0);
  vec3 neon = mix(NEON_CYAN, NEON_PINK, hue);
  vec3 gridColor = mix(neon, NEON_PURP, pulse);

  // Dark moody base body, lit subtly
  vec3 base = vec3(0.02, 0.02, 0.05);
  vec3 lit  = base + diff * vec3(0.06, 0.02, 0.10) * uLightColor;

  // Emissive grid + neon fresnel rim + hot specular
  vec3 color = lit;
  color += gridColor * grid * (1.2 + pulse);
  color += neon * fres * 2.2;            // glowing silhouette
  color += spec * uLightColor;           // specular highlights
  color += vGlitch * NEON_CYAN * 0.6;    // glitch slices flash cyan

  // --- Depth fog using both provided matrices ---
  vec4 clip = uProjectionMatrix * uViewMatrix * vec4(vWorldPosition, 1.0);
  float depth = clip.z / clip.w;
  float fog = smoothstep(0.3, 1.0, depth);
  color = mix(color, vec3(0.01, 0.0, 0.03), fog * 0.6);

  // --- CRT scanlines + vignette from resolution; uDelta energy flicker ---
  vec2 st = gl_FragCoord.xy / uResolution;
  float scan     = 0.85 + 0.15 * sin(st.y * uResolution.y * 1.5 - uTime * 12.0);
  float vignette = smoothstep(1.2, 0.25, length(st - 0.5));
  color *= scan * vignette;
  color *= 1.0 + uDelta * 1.2;

  gl_FragColor = vec4(color, 1.0);
}`;
