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

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x060609, 1);
    this.container.appendChild(this.renderer.domElement);

    this.resizeHandler = this.debounce(() => this.onResize(), 100);
    this.mouseMoveHandler = (e) => this.onMouseMove(e);
    this.orientationHandler = () => {
      // Handle orientation change with delay to ensure viewport settles
      setTimeout(() => this.onResize(), 100);
    };

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('orientationchange', this.orientationHandler);
    
    // Use visualViewport API if available for more accurate mobile sizing
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.resizeHandler);
    }
  }

  onMouseMove(event) {
    if (this.uniforms) {
      this.uniforms.uMouse.value.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.uniforms.uMouse.value.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  }

  createParticles() {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Disk distribution
      const radius = Math.random() * Math.random() * 3.0 + 0.2;
      const theta = Math.random() * Math.PI * 2;

      // Slight vertical spread based on radius
      const ySpread = (1.0 - radius / 3.2) * (Math.random() - 0.5) * 0.3;

      positions[i * 3] = radius * Math.cos(theta);
      positions[i * 3 + 1] = ySpread;
      positions[i * 3 + 2] = radius * Math.sin(theta);

      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();

      sizes[i] = Math.random() * 0.5 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uActivity: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) }
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
    this.particles.rotation.x = Math.PI * 0.15; // Tilt the vortex
    this.scene.add(this.particles);
  }

  setActivity(level) {
    // 0 = idle, 1 = fully active (thinking/responding)
    this.targetActivity = Math.max(0, Math.min(1, level));
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  onResize() {
    // Use visualViewport if available for better mobile support
    const width = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    // Smooth activity transition
    this.activity += (this.targetActivity - this.activity) * 0.06;

    if (this.uniforms) {
      this.uniforms.uTime.value = elapsed;
      this.uniforms.uActivity.value = this.activity;
    }

    // Slow rotation
    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    window.removeEventListener('orientationchange', this.orientationHandler);
    
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.resizeHandler);
    }

    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
      this.scene.remove(this.particles);
    }

    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }
}
