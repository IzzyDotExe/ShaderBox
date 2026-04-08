import * as THREE from 'three'

// Helper to create geometry based on shape name
export const createGeometry = (shape) => {
  switch (shape) {
    case 'sphere':
      return new THREE.SphereGeometry(0.7, 32, 32)
    case 'pyramid':
      // pyramid as cone with 4 sides and small height
      return new THREE.ConeGeometry(0.8, 1.2, 4)
    case 'cube':
      return new THREE.BoxGeometry()
    case 'torus':
      return new THREE.TorusGeometry(0.5, 0.2, 16, 100)
    case 'cylinder':
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
    case 'cone':
      return new THREE.ConeGeometry(0.6, 1.2, 32)
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(0.7)
    case 'square':
      return new THREE.PlaneGeometry()
    case 'circle':
      return new THREE.CircleGeometry(0.7, 32)
    case 'ring':
      return new THREE.RingGeometry(0.3, 0.7, 32)
    default:
      return new THREE.BoxGeometry()
  }
}
