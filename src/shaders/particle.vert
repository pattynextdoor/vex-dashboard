uniform float uTime;
uniform float uActivity;
uniform float uSize;

attribute float aPhase;
attribute float aSpeed;

varying float vAlpha;
varying float vPhase;

void main() {
  vec3 pos = position;
  
  // Orbital motion
  float angle = uTime * aSpeed * 0.3 + aPhase;
  float radius = length(pos.xy);
  pos.x += sin(angle) * 0.15 * radius;
  pos.y += cos(angle * 0.7) * 0.15 * radius;
  pos.z += sin(angle * 0.5 + aPhase) * 0.1;
  
  // Activity response — particles pull inward when thinking
  float pull = uActivity * 0.3;
  pos *= 1.0 - pull * 0.2;
  
  // Breathing
  float breath = sin(uTime * 0.5 + aPhase) * 0.02;
  pos *= 1.0 + breath;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Size attenuation
  float size = uSize * (1.0 + uActivity * 0.5);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  
  vAlpha = 0.3 + uActivity * 0.4 + sin(uTime + aPhase) * 0.1;
  vPhase = aPhase;
}
