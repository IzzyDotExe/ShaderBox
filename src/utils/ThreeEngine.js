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

    // Snapshot the built-in uniform names so updateCustomUniforms() can prune
    // user-deleted uniforms without ever removing a built-in.
    this.builtInUniformNames = new Set(Object.keys(this.uniforms));

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

    // Permanently watch for shader errors that slip past the compile-time
    // capture below (e.g. errors surfaced during a later render).
    this.originalConsoleError = console.error;
    console.error = (...args) => {
      const msg = ThreeEngine._stringifyConsoleArgs(args);
      if (ThreeEngine._isShaderError(msg) && this.onError) this.onError(msg);
      this.originalConsoleError.apply(console, args);
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms
    });

    const geometry = createGeometry(shape);
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    try {
      const compileError = this._captureShaderError(() => this.renderer.compile(this.scene, this.camera));
      if (compileError && this.onError) this.onError(compileError);
    } catch (e) {
      if (this.onError) this.onError(e.message || String(e));
    }
  }

  // Formats console.error arguments into a single searchable string.
  static _stringifyConsoleArgs(args) {
    return args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  }

  // True if a console message looks like a Three.js / WebGL shader-compile error.
  static _isShaderError(msg) {
    return msg.includes('ERROR:') || msg.includes('THREE.WebGLProgram');
  }

  // True if a uniform entry holds a Three.js texture.
  static _isTextureEntry(entry) {
    return !!(entry && entry.value && entry.value.isTexture);
  }

  // Runs `action` while intercepting Three.js shader-compile logs, then restores
  // console.error. Returns the first captured error message, or null. Logs are
  // chained to the native console (not the permanent listener) so a compile
  // error is never reported twice.
  _captureShaderError(action) {
    const previousConsoleError = console.error;
    let captured = null;
    console.error = (...args) => {
      const msg = ThreeEngine._stringifyConsoleArgs(args);
      if (!captured && ThreeEngine._isShaderError(msg)) captured = msg;
      this.originalConsoleError.apply(console, args);
    };
    try {
      action();
    } finally {
      console.error = previousConsoleError;
    }
    return captured;
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
    // getDelta() advances the clock's internal oldTime/elapsedTime, so it must
    // be read first. Reading elapsedTime afterward gives the matching elapsed
    // value. (Calling getElapsedTime() first would consume the delta and leave
    // a subsequent getDelta() returning ~0.)
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.elapsedTime;

    this.uniforms.uTime.value = elapsedTime;
    this.uniforms.uDelta.value = delta;

    if (this.container) {
      this.uniforms.uResolution.value.set(this.container.clientWidth, this.container.clientHeight);
    }

    this.animatedUniforms.forEach(au => {
      try {
        const result = au.fn(elapsedTime, delta, this.uniforms.uMouse.value, this.uniforms.uResolution.value);
        if (result !== undefined) {
          if (typeof result === 'number') {
             this.uniforms[au.name].value = result;
          } else if (Array.isArray(result) || result.isVector2 || result.isVector3 || result.isVector4) {
             const x = result.x !== undefined ? result.x : (result[0] || 0);
             const y = result.y !== undefined ? result.y : (result[1] || 0);
             const z = result.z !== undefined ? result.z : (result[2] || 0);
             const w = result.w !== undefined ? result.w : (result[3] || 0);
             if (au.type === 'vec2') this.uniforms[au.name].value.set(x, y);
             else if (au.type === 'vec3') this.uniforms[au.name].value.set(x, y, z);
             else if (au.type === 'vec4') this.uniforms[au.name].value.set(x, y, z, w);
          }
        }
        if (window.__threeEngine) {
          if (!window.__threeEngine.uniformErrors) window.__threeEngine.uniformErrors = {};
          window.__threeEngine.uniformErrors[au.name] = null;
        }
      } catch (e) {
        if (window.__threeEngine) {
          if (!window.__threeEngine.uniformErrors) window.__threeEngine.uniformErrors = {};
          window.__threeEngine.uniformErrors[au.name] = e.message;
        }
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

  _defaultValueForType(type) {
    if (type === 'vec2') return new THREE.Vector2();
    if (type === 'vec3') return new THREE.Vector3();
    if (type === 'vec4') return new THREE.Vector4();
    return 0; // float
  }

  _valueMatchesType(value, type) {
    if (type === 'float') return typeof value === 'number';
    if (type === 'vec2') return !!(value && value.isVector2);
    if (type === 'vec3') return !!(value && value.isVector3);
    if (type === 'vec4') return !!(value && value.isVector4);
    return false;
  }

  _setupCustomUniform(cu) {
    if (!window.__threeEngine) window.__threeEngine = this;
    if (!window.__threeEngine.uniformErrors) window.__threeEngine.uniformErrors = {};

    if (cu.type === 'sampler2D') {
      const source = cu.value || 'https://threejs.org/examples/textures/uv_grid_opengl.jpg';
      const existing = this.uniforms[cu.name];
      // Reuse the existing texture when the source hasn't changed. Reloading on
      // every update (e.g. while scrubbing an unrelated float) leaks GPU textures.
      if (ThreeEngine._isTextureEntry(existing) && existing.__source === source) {
        return;
      }
      if (ThreeEngine._isTextureEntry(existing)) {
        existing.value.dispose();
      }
      const texture = new THREE.TextureLoader().load(source);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      this.uniforms[cu.name] = { value: texture, __source: source };
      return;
    }

    if (cu.isAnimated) {
      try {
        const fn = new Function('time', 'delta', 'mouse', 'resolution', cu.value);
        this.animatedUniforms.push({ name: cu.name, type: cu.type, fn });
        const existing = this.uniforms[cu.name];
        // Recreate the value holder if it's missing or its type changed, so the
        // animate loop's .set() never runs against a mismatched value.
        if (!existing || !this._valueMatchesType(existing.value, cu.type)) {
          this.uniforms[cu.name] = { value: this._defaultValueForType(cu.type) };
        }
        window.__threeEngine.uniformErrors[cu.name] = null;
      } catch (e) {
        window.__threeEngine.uniformErrors[cu.name] = "Compile Error: " + e.message;
        console.error(`Failed to compile script for uniform ${cu.name}`, e);
      }
    } else {
      let val;
      const parts = String(cu.value).split(',').map(v => parseFloat(v));
      if (cu.type === 'float') val = parts[0] || 0;
      else if (cu.type === 'vec2') val = new THREE.Vector2(parts[0]||0, parts[1]||0);
      else if (cu.type === 'vec3') val = new THREE.Vector3(parts[0]||0, parts[1]||0, parts[2]||0);
      else if (cu.type === 'vec4') val = new THREE.Vector4(parts[0]||0, parts[1]||0, parts[2]||0, parts[3]||0);

      const existing = this.uniforms[cu.name];
      if (!existing || !this._valueMatchesType(existing.value, cu.type)) {
        this.uniforms[cu.name] = { value: val };
      } else {
        existing.value = val;
      }
    }
  }

  updateCustomUniforms(customUniforms) {
    if (!this.mesh) return;

    const incoming = customUniforms || [];
    const desiredNames = new Set(incoming.map(cu => cu.name));

    // Prune uniforms the user deleted. Built-ins are never removed.
    Object.keys(this.uniforms).forEach(name => {
      if (this.builtInUniformNames.has(name) || desiredNames.has(name)) return;
      const entry = this.uniforms[name];
      if (ThreeEngine._isTextureEntry(entry)) {
        entry.value.dispose();
      }
      delete this.uniforms[name];
      if (window.__threeEngine && window.__threeEngine.uniformErrors) {
        delete window.__threeEngine.uniformErrors[name];
      }
    });

    this.animatedUniforms = [];
    incoming.forEach(cu => this._setupCustomUniform(cu));

    // In case new uniforms were added to the material, we flag for update.
    this.mesh.material.needsUpdate = true;
  }

  updateShaders(vertexShader, fragmentShader) {
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    if (!this.mesh) return;

    const oldMaterial = this.mesh.material;
    let newMaterial = null;

    try {
      // Swap in the new material and pre-compile it so the WebGL program links
      // immediately and any shader error surfaces now (captured via console.error).
      const compileError = this._captureShaderError(() => {
        newMaterial = new THREE.ShaderMaterial({
          vertexShader: this.vertexShader,
          fragmentShader: this.fragmentShader,
          uniforms: this.uniforms
        });
        this.mesh.material = newMaterial;
        this.renderer.compile(this.scene, this.camera);
      });

      if (compileError) {
        if (this.onError) this.onError(compileError);
        this.mesh.material = oldMaterial; // roll back to the working shader
        if (newMaterial) newMaterial.dispose();
      } else {
        oldMaterial.dispose();
      }
    } catch (e) {
      if (this.onError) this.onError(e.message || String(e));
      this.mesh.material = oldMaterial;
      if (newMaterial) newMaterial.dispose();
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

    // Dispose any uploaded textures held by custom uniforms.
    Object.values(this.uniforms).forEach(entry => {
      if (ThreeEngine._isTextureEntry(entry)) {
        entry.value.dispose();
      }
    });

    this.renderer.dispose();
    if (this.container && this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
