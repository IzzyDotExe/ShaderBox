export class ThreeControls {
  constructor(container, domElement, uniforms) {
    this.container = container;
    this.domElement = domElement;
    this.uniforms = uniforms;

    this.targetZoom = 2;
    this.targetRot = { x: 0, y: 0 };
    
    this.isDragging = false;
    this.prevX = 0;
    this.prevY = 0;

    this.bindEvents();
  }

  onPointerDown = (e) => {
    this.isDragging = true;
    this.prevX = e.clientX;
    this.prevY = e.clientY;
    this.domElement.style.cursor = 'grabbing';
  };

  onPointerMove = (e) => {
    const rect = this.domElement.getBoundingClientRect();
    this.uniforms.uMouse.value.x = (e.clientX - rect.left) / rect.width;
    this.uniforms.uMouse.value.y = 1.0 - ((e.clientY - rect.top) / rect.height);

    if (!this.isDragging) return;
    
    const deltaX = e.clientX - this.prevX;
    const deltaY = e.clientY - this.prevY;
    this.prevX = e.clientX;
    this.prevY = e.clientY;
    this.targetRot.y += deltaX * 0.003;
    this.targetRot.x += deltaY * 0.003;
  };

  onPointerUp = () => {
    this.isDragging = false;
    this.domElement.style.cursor = 'grab';
  };

  onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.1 : -0.1;
    this.targetZoom += delta;
    if (this.targetZoom < 1) this.targetZoom = 1;
    if (this.targetZoom > 5) this.targetZoom = 5;
  };

  bindEvents() {
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('pointerup', this.onPointerUp);
    this.domElement.addEventListener('pointerleave', this.onPointerUp);
    this.container.addEventListener('wheel', this.onWheel, { passive: false });
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.domElement.removeEventListener('pointerleave', this.onPointerUp);
    this.container.removeEventListener('wheel', this.onWheel);
  }

  update(mesh, camera) {
    if (mesh) {
      mesh.rotation.x += (this.targetRot.x - mesh.rotation.x) * 0.1;
      mesh.rotation.y += (this.targetRot.y - mesh.rotation.y) * 0.1;
    }
    
    if (camera) {
      const currentZ = camera.position.z;
      camera.position.z += (this.targetZoom - currentZ) * 0.1;
    }
  }
}
