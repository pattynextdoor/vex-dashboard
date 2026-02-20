varying vec3 vColor;
varying float vAlpha;

void main() {
  // Sharp, glowing point
  float dist = length(gl_PointCoord - vec2(0.5));

  // Create a sharp core with a soft glow
  float core = smoothstep(0.5, 0.1, dist);
  float glow = smoothstep(0.5, 0.3, dist) * 0.3;

  float alpha = (core + glow) * vAlpha * 0.6;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(vColor * 0.7, alpha);
}
