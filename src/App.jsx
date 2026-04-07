import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ShapesSidebar } from './components/ShapeSidebar'

import { Button } from "@shadcn/ui/components/ui/button"
import CodeBlock from './components/CodeBlock'

// Helper to create geometry based on shape name
const createGeometry = (shape) => {
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
  }
}

const defaultVertexShader = `uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(pos.x * 5.0 + uTime) * 0.1;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

const defaultFragmentShader = `uniform float uTime;
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(vUv.x, vUv.y, (sin(uTime) + 1.0) / 2.0, 1.0);
}`;

const App = () => {
  const [shape, setShape] = useState('cube');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [vertexShader, setVertexShader] = useState(defaultVertexShader);
  const [fragmentShader, setFragmentShader] = useState(defaultFragmentShader);
  const uniformsRef = useRef({
    uTime: { value: 0 }
  });

  const [activeMaterial, setActiveMaterial] = useState(() => new THREE.ShaderMaterial({
    vertexShader: defaultVertexShader,
    fragmentShader: defaultFragmentShader,
    uniforms: uniformsRef.current
  }));

  const targetZoomRef = useRef(2);
  const mountRef = useRef(null)
  const meshRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)

  const handleRunShaders = () => {
    try {
      const newMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: uniformsRef.current
      });
      if (meshRef.current) {
        meshRef.current.material.dispose();
        meshRef.current.material = newMaterial;
        setActiveMaterial(newMaterial);
      }
    } catch (e) {
      console.error("Shader compilation error:", e);
    }
  };

  // Store camera reference for later re-render
  const cameraRef = useRef(null)

  // Drag and rotation state refs
  const targetRot = useRef({ x: 0, y: 0 })
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
    const mesh = new THREE.Mesh(geometry, activeMaterial)
    meshRef.current = mesh
    scene.add(mesh)


    // Start animation loop for lerped rotation
    let animId
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime()
      uniformsRef.current.uTime.value = elapsedTime;

      if (meshRef.current) {
        meshRef.current.rotation.x += (targetRot.current.x - meshRef.current.rotation.x) * 0.1
        meshRef.current.rotation.y += (targetRot.current.y - meshRef.current.rotation.y) * 0.1
      }
      // Lerp camera zoom towards targetZoomRef
      const cam = cameraRef.current
      if (cam) {
        const currentZ = cam.position.z
        cam.position.z += (targetZoomRef.current - currentZ) * 0.1
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
    // Update geometry when shape changes and re-render
    if (meshRef.current) {
      const newGeom = createGeometry(shape)
      meshRef.current.geometry.dispose()
      meshRef.current.geometry = newGeom
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
  }, [shape])

  // Adjust renderer and camera when viewport size changes due to sidebar toggle
  useEffect(() => {
    if (rendererRef.current && mountRef.current && cameraRef.current) {
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      rendererRef.current.setSize(width, height)
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
    }
  }, [sidebarOpen, rightSidebarOpen])

  // Zoom camera on mouse wheel
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const handleWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.1 : -0.1
      targetZoomRef.current += delta
      // clamp desired zoom limits
      if (targetZoomRef.current < 1) targetZoomRef.current = 1
      if (targetZoomRef.current > 5) targetZoomRef.current = 5
    }
    el.addEventListener('wheel', handleWheel)
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {sidebarOpen && <div style={{ width: 250, backgroundColor: 'rgba(34,34,34,.8)', color: '#fff', padding: 20, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}><ShapesSidebar shape={shape} setShape={setShape} /></div>}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(17,17,17,.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
        <Button onClick={() => setSidebarOpen(prev => !prev)} style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, color: '#fff', margin: '4px' }}>{sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}</Button>
        <Button onClick={() => setRightSidebarOpen(prev => !prev)} style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 10, color: '#fff', margin: '4px' }}>{rightSidebarOpen ? 'Hide Editor' : 'Show Editor'}</Button>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      </div>
      {rightSidebarOpen && <div className='flex flex-col align-middle justify-center' style={{ width: 550, backgroundColor: 'rgba(34,34,34,.8)', color: '#fff', padding: 20, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
        <CodeBlock 
          className='my-6' 
          title="vertexShader.glsl" 
          value={vertexShader} 
          onChange={setVertexShader} 
          onRun={handleRunShaders} 
        />
        <CodeBlock 
          className='my-6' 
          title="fragmentShader.glsl" 
          value={fragmentShader} 
          onChange={setFragmentShader} 
          onRun={handleRunShaders} 
        />
      </div>}
    </div>
  ) 
}

export default App
