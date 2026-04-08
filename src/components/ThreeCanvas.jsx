import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createGeometry } from '../utils/geometry'

const ThreeCanvas = ({ shape, vertexShader, fragmentShader }) => {
  const mountRef = useRef(null)
  const meshRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)

  const uniformsRef = useRef({
    uTime: { value: 0 }
  });

  const targetZoomRef = useRef(2)
  const targetRot = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const prevXRef = useRef(0)
  const prevYRef = useRef(0)

  // Initialize Scene, Camera, Renderer, and Animation Loop
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 2
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) // alpha added for transparent background
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer
    sceneRef.current = scene

    const initialMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current
    });
    const geometry = createGeometry(shape)
    const mesh = new THREE.Mesh(geometry, initialMaterial)
    meshRef.current = mesh
    scene.add(mesh)

    // Animation loop
    let animId
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime()
      uniformsRef.current.uTime.value = elapsedTime;

      if (meshRef.current) {
        meshRef.current.rotation.x += (targetRot.current.x - meshRef.current.rotation.x) * 0.1
        meshRef.current.rotation.y += (targetRot.current.y - meshRef.current.rotation.y) * 0.1
      }
      
      const cam = cameraRef.current
      if (cam) {
        const currentZ = cam.position.z
        cam.position.z += (targetZoomRef.current - currentZ) * 0.1
      }
      
      renderer.render(scene, camera)
      animId = requestAnimationFrame(animate)
    }
    animate()

    // Drag events
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
      if (mountRef.current && el) {
        mountRef.current.removeChild(el)
      }
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointerleave', onPointerUp)
      cancelAnimationFrame(animId)
      renderer.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && mountRef.current && cameraRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    
    // Resize Observer for element resize
    const resizeObserver = new ResizeObserver(() => handleResize())
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current)
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect()
    };
  }, []);

  // Handle Shader updates
  useEffect(() => {
    if (meshRef.current) {
      try {
        const newMaterial = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: uniformsRef.current
        });
        meshRef.current.material.dispose();
        meshRef.current.material = newMaterial;
      } catch (e) {
        console.error("Shader compilation error:", e);
      }
    }
  }, [vertexShader, fragmentShader])

  // Handle Shape updates
  useEffect(() => {
    if (meshRef.current) {
      const newGeom = createGeometry(shape)
      meshRef.current.geometry.dispose()
      meshRef.current.geometry = newGeom
      // Render triggered by animation loop automatically
    }
  }, [shape])

  // Handle Zoom
  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const handleWheel = (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.1 : -0.1
      targetZoomRef.current += delta
      if (targetZoomRef.current < 1) targetZoomRef.current = 1
      if (targetZoomRef.current > 5) targetZoomRef.current = 5
    }
    el.addEventListener('wheel', handleWheel)
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}

export default ThreeCanvas
