# 🌌 Live WebGL Shader Playground

[Try it out live!](https://shaderbox.izzydotexe.ca/)

A web-based 3D environment and GLSL IDE built with React, Vite, and Three.js. This application allows users to explore and interact with 3D primitives while writing, testing, and debugging custom GLSL vertex and fragment shaders in real-time.

<img width="2374" height="1439" alt="image" src="https://github.com/user-attachments/assets/1fbf52ba-0dcd-4d77-b1d7-447ea3eb629e" />


## 🚀 Features

- **Interactive 3D Viewport**: Manipulate 3D shapes with dragging, orbiting, and scrolling using custom Three.js controls.
- **Live Shader Editor**: Write raw GLSL in the built-in IDE (right sidebar) featuring syntax highlighting via PrismJS and a live compilation loop. Error handling natively catches WebGL compile errors and displays them smoothly.
- **Dynamic Uniforms Manager**: Inject your own variables into your shaders directly from the UI!
  - **Built-in Uniforms**: Easily inject standard variables like `uTime`, `uResolution`, `uMouse`, `uCameraPosition`, `uRotation`, and lighting vectors.
  - **Interactive Controls**: Static uniforms feature intuitive UI controls:
    - **Drag-to-Scrub**: Click and drag horizontally on any static `float` value in the sidebar to adjust it in real-time.
    - **Color Pickers**: Name a `vec3` or `vec4` uniform with "color" (e.g., `uGlowColor`) to automatically generate a native HTML color picker for live WebGL color injection.
  - **Texture Support (`sampler2D`)**: Select `sampler2D` as a uniform type to reveal an image upload button. Images are instantly loaded via `THREE.TextureLoader` and mapped to your fragment shaders!
  - **Animated JavaScript Uniforms**: Create a custom uniform and assign it a live JavaScript function! Evaluate values per-frame using an embedded JS code editor (`return Math.sin(time)`).
    - **Snippet Injectors**: The JS Editor includes a dropdown with ready-to-use math snippets (Sine Pulse, Rainbow RGB, Circular Motion, etc.).
    - **Error Boundaries**: Broken JS won't crash the render loop. Syntax and runtime errors are caught, displaying a warning badge and error message directly in the UI.
- **Primitive Shapes**: Switch between Cube, Sphere, Pyramid, Square (Plane), and Ring geometries.
- **State Persistence**: Your custom uniforms, shaders, chosen shape, and background settings automatically save to `localStorage` and persist through reloads.
- **Modern UI**: Polished interface components powered by shadcn/ui and styled natively with Tailwind CSS v4.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **3D Render Engine**: Three.js
- **UI Components**: shadcn/ui (isolated in the `@shadcn` root directory)
- **Styling**: Tailwind CSS v4
- **Icons**: Phosphor Icons
- **Code Editor**: `react-simple-code-editor` + `PrismJS` for GLSL and JS syntax highlighting

## 📦 Project Structure & Setup

This repository uses a customized layout where the `shadcn/ui` components are stored at the root `@shadcn` directory instead of standard integration into `src/`. For a comprehensive view of how to configure components, paths, and styles, refer to the [AGENTS.md](./AGENTS.md) guide provided in the root folder.

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

You can open the "Editor" sidebar on the right to edit the vertex and fragment shaders.

**Available Built-in Uniforms:**
- `uniform float uTime;` – Elapsed time in seconds.
- `uniform vec2 uResolution;` – Viewport resolution (width, height).
- `uniform vec2 uMouse;` – Mouse position on the canvas.
- `uniform float uDelta;` – Time difference between frames.
- `uniform mat4 uViewMatrix;` – Current camera view matrix.
- `uniform mat4 uProjectionMatrix;` – Camera projection matrix.
- `uniform mat3 uNormalMatrix;` – Normal matrix for transforming normals into eye space.
- `uniform vec3 uLightDirection;` – Direction of a single directional light.
- `uniform vec3 uLightColor;` – Color/intensity of the light.
- `uniform vec3 uCameraPosition;` – World position of the camera.
- `uniform vec3 uRotation;` – The real-time X, Y, Z Euler rotation angles of the 3D mesh.

**Creating Custom Uniforms:**
1. Open the "Uniforms" sidebar on the left.
2. Under "Custom", add a Name (e.g., `uGlowColor`), select a Type (e.g., `vec3`), and toggle **Animated**.
3. If setting a `float` or a color `vec3`, you can use the drag-to-scrub slider or HTML color picker next to its value.
4. If choosing `sampler2D`, upload an image from your computer to map it as a generic 2D texture.
5. If animated, click **"Write JS Body"** to open a modal where you can write a JavaScript function that evaluates every frame (e.g., `return [Math.sin(time), 0.5, 1.0];`). Don't forget the **"Insert Snippet"** dropdown!
6. Inject your new uniform into the shader code by clicking it and use it in your GLSL program!

**Available Varying Data (Passed by Three.js):**
- `varying vec2 vUv;` – UV coordinates (passed from the vertex shader).
- `varying vec3 vNormal;` – Normals (passed from the vertex shader).
- `varying vec3 vWorldPosition;` / `vLocalPosition;` – Positions (calculated during transformations).
