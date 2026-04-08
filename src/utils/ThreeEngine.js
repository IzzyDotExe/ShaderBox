import * as THREE from 'three';
import { createGeometry } from './geometry';
import { ThreeControls } from './ThreeControls';

export class ThreeEngine {
  constructor(container, shape, vertexShader, fragmentShader) {
    this.container = container;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uMouse: { value: new THREE.Vector2() },
      uDelta: { value: 0 },
      uViewMatrix: { value: new THREE.Matrix4() },
      uProjectionMatrix: { value: new THREE.Matrix4() },
      uNormalMatrix: { value: new THREE.Matrix3() },
      uLightDirection: { value: new THREE.Vector3(0, 0, -1) },
      uLightColor: { value: new THREE.Color(1, 1, 1) },
      uCameraPosition: { value: new THREE.Vector3() }
    };

    this.init(shape);
    
    // Abstracted interaction logic into dedicated controller
    this.controls = new ThreeControls(this.container, this.renderer.domElement, this.uniforms);
    
    this.clock = new THREE.Clock();
    this.animId = null;
    this.animate();
    
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  init(shape) {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 2;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    const material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms
    });
    
    const geometry = createGeometry(shape);
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  handleResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate = () => {
    const elapsedTime = this.clock.getElapsedTime();
    this.uniforms.uTime.value = elapsedTime;
    this.uniforms.uDelta.value = this.clock.getDelta();

    if (this.container) {
      this.uniforms.uResolution.value.set(this.container.clientWidth, this.container.clientHeight);
    }

    if (this.mesh && this.camera) {
      this.controls.update(this.mesh, this.camera);
    }

    if (this.mesh) {
      this.uniforms.uNormalMatrix.value.getNormalMatrix(this.mesh.matrixWorld);
    }

    if (this.camera) {
      this.uniforms.uViewMatrix.value.copy(this.camera.matrixWorldInverse);
      this.uniforms.uProjectionMatrix.value.copy(this.camera.projectionMatrix);
      this.uniforms.uCameraPosition.value.setFromMatrixPosition(this.camera.matrixWorld);
    }

    this.renderer.render(this.scene, this.camera);
    this.animId = requestAnimationFrame(this.animate);
  }

  updateShape(shape) {
    if (!this.mesh) return;
    const newGeom = createGeometry(shape);
    this.mesh.geometry.dispose();
    this.mesh.geometry = newGeom;
  }

  updateShaders(vertexShader, fragmentShader) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    if (!this.mesh) return;
    try {
      const newMaterial = new THREE.ShaderMaterial({
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
        uniforms: this.uniforms
      });
      this.mesh.material.dispose();
      this.mesh.material = newMaterial;
    } catch (e) {
      console.error('Shader compilation error:', e);
    }
  }

  dispose() {
    cancelAnimationFrame(this.animId);
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    
    this.renderer.dispose();
    if (this.container && this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
