import * as THREE from 'three';
import vertexShader from './shaders/particle.vert?raw';
import fragmentShader from './shaders/particle.frag?raw';

export class VexCore {
  constructor(container) {
    this.container = container;
    this.activity = 0;
    this.targetActivity = 0;
    this.clock = new THREE.Clock();
    
    this.init();
    this.createParticles();
    this.animate();
  }
  
  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 4;
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a0f, 1);
    this.container.appendChild(this.renderer.domElement);
    
    window.addEventListener('resize', () => this.onResize());
  }
  
  createParticles() {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Spherical distribution with concentration toward center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.6) * 2;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 1.5;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    
    this.uniforms = {
      uTime: { value: 0 },
      uActivity: { value: 0 },
      uSize: { value: 3.0 },
    };
    
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  setActivity(level) {
    // 0 = idle, 1 = fully active (thinking/responding)
    this.targetActivity = Math.max(0, Math.min(1, level));
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const elapsed = this.clock.getElapsedTime();
    
    // Smooth activity transition
    this.activity += (this.targetActivity - this.activity) * 0.03;
    
    this.uniforms.uTime.value = elapsed;
    this.uniforms.uActivity.value = this.activity;
    
    // Slow rotation
    this.particles.rotation.y = elapsed * 0.05;
    this.particles.rotation.x = Math.sin(elapsed * 0.03) * 0.1;
    
    this.renderer.render(this.scene, this.camera);
  }
}
