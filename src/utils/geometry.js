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
    case 'square':
      return new THREE.PlaneGeometry()
    case 'circle':
      return new THREE.CircleGeometry()
    default:
      return new THREE.BoxGeometry()
  }
}
