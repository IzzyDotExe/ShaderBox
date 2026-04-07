# React 3D Cube & Shader Playground

A web-based 3D environment built with React, Vite, and Three.js. This application allows users to explore and interact with 3D primitives while writing and testing custom GLSL vertex and fragment shaders in real-time.

## 🚀 Features

- **Interactive 3D Viewport**: Manipulate 3D shapes with mouse controls (drag to rotate, scroll to zoom).
- **Primitive Shapes**: Switch between Cube, Sphere, Pyramid, Square (Plane), and Circle geometries using the left sidebar.
- **Live Shader Editing**: Write raw GLSL in the built-in IDE (right sidebar) featuring syntax highlighting via PrismJS.
- **Dynamic Uniforms**: Time-based animations are readily available via the `uTime` float uniform injected automatically into your shaders.
- **Modern UI**: Polished interface components powered by shadcn/ui and styled with Tailwind CSS v4.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **3D Library**: Three.js
- **UI Components**: shadcn/ui (isolated in the `@shadcn` root directory)
- **Styling**: Tailwind CSS v4
- **Icons**: Phosphor Icons
- **Code Editor**: `react-simple-code-editor` + `prismjs` for GLSL syntax highlighting

## 📦 Project Structure & Setup

This repository uses a customized layout where the `shadcn/ui` components are stored at the root `@shadcn` directory instead of standard integration into `src/`. For a comprehensive view of how to configure components, paths, and styles, refer to the [AI_REFERENCE_GUIDE.md](./AI_REFERENCE_GUIDE.md) provided in the root folder.

## 🏃 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## 🎨 Writing Shaders

You can open the "Editor" sidebar to inject custom shaders into the active material.

**Available Uniforms:**
- `uniform float uTime;` – The elapsed time in seconds. Use this to animate vertices or fragment colors.

**Available Varying Data (Passed by Three.js standard geometries):**
- `varying vec2 vUv;` – UV coordinates. Unpack these to apply textures or gradient logic across meshes.

### Default Example

**Vertex Shader:**
```glsl
uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(pos.x * 5.0 + uTime) * 0.1;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

**Fragment Shader:**
```glsl
uniform float uTime;
varying vec2 vUv;

void main() {
  gl_FragColor = vec4(vUv.x, vUv.y, (sin(uTime) + 1.0) / 2.0, 1.0);
}
```