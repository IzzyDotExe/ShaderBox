import * as THREE from 'three';
import { createGeometry } from './geometry';
import { ThreeControls } from './ThreeControls';

export class ThreeEngine {
  constructor(container, shape, vertexShader, fragmentShader, onError, customUniforms = []) {
    this.container = container;
    this.onError = onError || console.error;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.initialCustomUniforms = customUniforms;

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
      uCameraPosition: { value: new THREE.Vector3() },
      uRotation: { value: new THREE.Vector3() }
    };
    
    this.animatedUniforms = [];

    (this.initialCustomUniforms || []).forEach(cu => {
      this._setupCustomUniform(cu);
    });

    this.init(shape);
    window.__threeEngine = this;
    
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
    this.renderer.debug.checkShaderErrors = true; // Enables WebGL error parsing in console
    this.container.appendChild(this.renderer.domElement);

    // Ensure we permanently listen to shader errors just in case they slip by the compile try blocks
    this.originalConsoleError = console.error;
    console.error = (...args) => {
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      if (msg.includes('ERROR:') || msg.includes('THREE.WebGLProgram')) {
        if (this.onError) this.onError(msg);
      }
      this.originalConsoleError.apply(console, args);
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms
    });
    
    let caughtInitError = null;
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      if (msg.includes('ERROR:') || msg.includes('THREE.WebGLProgram')) {
        caughtInitError = msg;
      }
      originalConsoleError.apply(console, args);
    };

    const geometry = createGeometry(shape);
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    try {
      this.renderer.compile(this.scene, this.camera);
      if (caughtInitError) {
        if (this.onError) this.onError(caughtInitError);
      }
    } catch (e) {
      if (this.onError) this.onError(e.message || String(e));
    } finally {
      console.error = originalConsoleError;
    }
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
    const delta = this.clock.getDelta();

    this.uniforms.uTime.value = elapsedTime;
    this.uniforms.uDelta.value = delta;

    if (this.container) {
      this.uniforms.uResolution.value.set(this.container.clientWidth, this.container.clientHeight);
    }

    this.animatedUniforms.forEach(au => {
      try {
        const result = au.fn(elapsedTime, delta, this.uniforms.uMouse.value, this.uniforms.uResolution.value);
        if (result !== undefined) {
          if (au.type === 'float') {
            this.uniforms[au.name].value = Number(result);
          } else if (Array.isArray(result)) {
            if (au.type === 'vec2') this.uniforms[au.name].value.set(result[0] || 0, result[1] || 0);
            else if (au.type === 'vec3') this.uniforms[au.name].value.set(result[0] || 0, result[1] || 0, result[2] || 0);
            else if (au.type === 'vec4') this.uniforms[au.name].value.set(result[0] || 0, result[1] || 0, result[2] || 0, result[3] || 0);
          }
        }
      } catch (e) {
        // Silently fail on runtime errors for now
      }
    });

    if (this.mesh && this.camera) {
      this.uniforms.uRotation.value.set(this.mesh.rotation.x, this.mesh.rotation.y, this.mesh.rotation.z);
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

  _setupCustomUniform(cu) {
    if (cu.isAnimated) {
      try {
        const fn = new Function('time', 'delta', 'mouse', 'resolution', cu.value);
        this.animatedUniforms.push({ name: cu.name, type: cu.type, fn });
        if (!this.uniforms[cu.name]) {
          let val;
          if (cu.type === 'float') val = 0;
          else if (cu.type === 'vec2') val = new THREE.Vector2();
          else if (cu.type === 'vec3') val = new THREE.Vector3();
          else if (cu.type === 'vec4') val = new THREE.Vector4();
          this.uniforms[cu.name] = { value: val };
        }
      } catch (e) {
        console.error(`Failed to compile script for uniform ${cu.name}`, e);
      }
    } else {
      let val;
      const parts = String(cu.value).split(',').map(v => parseFloat(v));
      if (cu.type === 'float') val = parts[0] || 0;
      else if (cu.type === 'vec2') val = new THREE.Vector2(parts[0]||0, parts[1]||0);
      else if (cu.type === 'vec3') val = new THREE.Vector3(parts[0]||0, parts[1]||0, parts[2]||0);
      else if (cu.type === 'vec4') val = new THREE.Vector4(parts[0]||0, parts[1]||0, parts[2]||0, parts[3]||0);
      
      if (!this.uniforms[cu.name]) {
        this.uniforms[cu.name] = { value: val };
      } else {
        this.uniforms[cu.name].value = val;
      }
    }
  }

  updateCustomUniforms(customUniforms) {
    if (!this.mesh) return;
    
    this.animatedUniforms = [];
    (customUniforms || []).forEach(cu => this._setupCustomUniform(cu));
    
    // In case new uniforms were added to the material, we flag for update.
    this.mesh.material.needsUpdate = true;
  }

  updateShaders(vertexShader, fragmentShader) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    if (!this.mesh) return;

    // We need to temporarily assign the new material to the mesh to compile it properly
    const oldMaterial = this.mesh.material;
    
    // Monkey-patch console.error to intercept Three.js shader compilation logs
    const originalConsoleError = console.error;
    let caughtError = null;
    console.error = (...args) => {
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      if (msg.includes('ERROR:') || msg.includes('THREE.WebGLProgram')) {
        caughtError = msg;
      }
      originalConsoleError.apply(console, args);
    };

    try {
      const newMaterial = new THREE.ShaderMaterial({
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
        uniforms: this.uniforms
      });
      this.mesh.material = newMaterial;
      
      // Pre-compile the material so the WebGL Program connects immediately
      this.renderer.compile(this.scene, this.camera);

      if (caughtError) {
        if (this.onError) this.onError(caughtError);
        // Rollback on error
        this.mesh.material = oldMaterial;
        newMaterial.dispose();
      } else {
        // Success
        oldMaterial.dispose();
      }
    } catch (e) {
      if (this.onError) this.onError(e.message || String(e));
      this.mesh.material = oldMaterial;
    } finally {
      // Restore console.error
      console.error = originalConsoleError;
    }
  }

  dispose() {
    if (window.__threeEngine === this) {
      window.__threeEngine = null;
    }
    console.error = this.originalConsoleError || console.error;
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
