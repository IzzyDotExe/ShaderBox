export const defaultVertexShader = `uniform float uTime;
uniform vec3 uRotation;

varying vec2 vUv;
varying vec3 vNormal; // passing local normal
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;

void main() {
  vUv = uv;
  vNormal = normal; 
  vLocalPosition = position;
  
  // Organic morphing displacement effect using position, time, and the shape's real-time rotation
  float displacement = sin(position.x * 5.0 + uTime + uRotation.y) * 
                       cos(position.y * 5.0 + uTime + uRotation.x) * 
                       sin(position.z * 5.0 + uTime + uRotation.z) * 0.15;
                       
  vec3 newPosition = position + normal * displacement;

  vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
  vWorldPosition = worldPos.xyz;
  
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}`;

export const defaultFragmentShader = `uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uDelta;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uCameraPosition;
uniform vec3 uRotation;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;

// Cosine based palette generator (Inigo Quilez)
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
  // Normalize screen coordinates and mouse
  vec2 st = gl_FragCoord.xy / uResolution;
  
  // Transform local normal to world space using our explicitly provided normal matrix
  vec3 worldNormal = normalize(uNormalMatrix * vNormal);
  
  // View direction towards the camera
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
  
  // Light setup (Reverse the direction so it shines onto the object)
  vec3 lightDir = normalize(-uLightDirection); 
  
  // Diffuse Lighting
  float diff = max(dot(worldNormal, lightDir), 0.0);
  
  // Specular Lighting (Phong)
  vec3 reflectDir = reflect(-lightDir, worldNormal);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
  
  // Fresnel/Rim Lighting for the glowing silhouette edges
  float fresnel = pow(1.0 - max(dot(worldNormal, viewDir), 0.0), 3.0);
  
  // Create an iridescent color gradient based on time, position, rotation, and mouse movement
  float patternTime = uTime * 0.5 + uRotation.y;
  float dPattern = length(vLocalPosition) - patternTime;
  
  // Add some pulsing energy based on the delta time (framerate variance translates to fluid pulsing)
  dPattern -= uDelta * 2.0;
  
  // Build a vibrant sci-fi palette
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  
  // Adding mouse X influence purely mathematically to color shifts
  vec3 d_pal = vec3(0.263, 0.416, 0.557) + vec3(uMouse.x * 0.0005);
  vec3 color = palette(dPattern + vUv.x, a, b, c, d_pal);
  
  // Generate a fake volumetric depth map ripple using projection and view matrices!
  vec4 screenPos = uProjectionMatrix * uViewMatrix * vec4(vWorldPosition, 1.0);
  float depth = screenPos.z / screenPos.w;
  float depthRipple = sin(depth * 30.0 - uTime * 5.0) * 0.15;
  
  // Combine all lighting algorithms
  vec3 ambient = color * 0.15;
  vec3 diffuse = diff * color * uLightColor;
  vec3 specularColor = spec * uLightColor * vec3(1.0, 0.9, 0.8);
  
  // Add an interactive glowing rim based on mouse Y position and ripples
  float rimIntensity = 1.5 + (uMouse.y * 0.001);
  vec3 rimColor = palette(dPattern - uTime, a, b, c, vec3(0.1, 0.2, 0.3));
  vec3 rimGlow = (fresnel * rimColor * rimIntensity) + vec3(depthRipple);
  
  // Assemble final masterpiece
  vec3 finalColor = ambient + diffuse + specularColor + rimGlow;

  gl_FragColor = vec4(finalColor, 1.0);
}`;
