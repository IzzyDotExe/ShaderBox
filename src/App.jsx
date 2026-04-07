import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ShapesSidebar } from './ShapeSidebar'

// Helper to create geometry based on shape name
const createGeometry = (shape) => {
  switch (shape) {
    case 'sphere':
      return new THREE.SphereGeometry(0.7, 32, 32)
    case 'pyramid':
      // pyramid as cone with 4 sides and small height
      return new THREE.ConeGeometry(0.8, 1.2, 4)
    default:
      return new THREE.BoxGeometry()
  }
}

const App = () => {
  const [shape, setShape] = useState('cube')
  const mountRef = useRef(null)
  const meshRef = useRef(null)
  const sceneRef = useRef(null)
const rendererRef = useRef(null)

   // Store camera reference for later re-render
   const cameraRef = useRef(null)

   // Drag and rotation state refs
   const targetRot = useRef({x:0,y:0})
   const isDraggingRef = useRef(false)
   const prevXRef = useRef(0)
   const prevYRef = useRef(0)

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 2
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    sceneRef.current = scene
    const geometry = createGeometry(shape)
    const material = new THREE.MeshNormalMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    meshRef.current = mesh
    scene.add(mesh)


    // Start animation loop for lerped rotation
    let animId
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.x += (targetRot.current.x - meshRef.current.rotation.x)*0.1
        meshRef.current.rotation.y += (targetRot.current.y - meshRef.current.rotation.y)*0.1
      }
      renderer.render(scene, camera)
      animId = requestAnimationFrame(animate)
    }
    animate()

    // Drag rotation handling using refs
    const el = renderer.domElement
    const onPointerDown = (e) => {
      isDraggingRef.current = true
      prevXRef.current = e.clientX
      prevYRef.current = e.clientY
      el.style.cursor = 'grabbing'
    }
    const onPointerMove = (e) => {
      if (!isDraggingRef.current || !meshRef.current) return
      const deltaX = e.clientX - prevXRef.current
      const deltaY = e.clientY - prevYRef.current
      prevXRef.current = e.clientX
      prevYRef.current = e.clientY
      targetRot.current.y += deltaX * 0.003
      targetRot.current.x += deltaY * 0.003
    }
    const onPointerUp = () => {
      isDraggingRef.current = false
      el.style.cursor = 'grab'
    }
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointerleave', onPointerUp)

    return () => {
      mountRef.current.removeChild(el)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointerleave', onPointerUp)
      cancelAnimationFrame(animId)
    }
  }, [])

  // Update geometry when shape changes and re-render
  useEffect(() => {
    if (meshRef.current) {
      const newGeom = createGeometry(shape)
      meshRef.current.geometry.dispose()
      meshRef.current.geometry = newGeom
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
  }, [shape])

  return (
  <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor:'rgba(17,17,17,.6)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)' }}>
    <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    <div style={{ position:'absolute', top:0, left:0, width:250, height:'100%', backgroundColor:'rgba(34,34,34,.8)', color:'#fff', padding:20, backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', flexDirection:'column' }}>
      <ShapesSidebar shape={shape} setShape={setShape} />
    </div>
  </div>
)
}

export default App
