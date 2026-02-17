uniform float uTime;
uniform float uActivity;

varying float vAlpha;
varying float vPhase;

void main() {
  // Soft circle
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  
  float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
  
  // Color shifts with activity — warm amber idle, cool blue when thinking
  vec3 idleColor = vec3(0.75, 0.65, 0.5);   // warm amber
  vec3 activeColor = vec3(0.5, 0.65, 0.8);  // cool blue
  vec3 color = mix(idleColor, activeColor, uActivity);
  
  // Subtle hue variation per particle
  color += 0.05 * sin(vPhase * 6.28 + uTime * 0.2);
  
  gl_FragColor = vec4(color, alpha * 0.6);
}
