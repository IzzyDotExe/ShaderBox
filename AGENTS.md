# AI Developer Reference Guide

This guide is intended for AI assistants and developers contributing to this project. It provides critical context about the project's non-standard structure, tech stack, and conventions.

## 🏗 Stack & Environment
- **Core**: React 18, Vite
- **UI & Styling**: Tailwind CSS v4, shadcn/ui, Phosphor Icons
- **3D Rendering**: Three.js

## 📂 Repository Structure
Unlike standard React/Vite projects, this project isolates its UI components in a root-level `@shadcn` directory rather than inside `src/`.

```
.
├── @shadcn/             # Isolated shadcn/ui directory
│   ├── ui/              
│   │   ├── components/  # All shadcn UI components (button, sidebar, etc.)
│   │   ├── hooks/       # UI related hooks (use-mobile, etc.)
│   │   └── lib/         # UI utilities (cn, etc.)
├── src/                 # Application source code
│   ├── components/      # Project-specific React components
│   │   ├── Card.jsx
│   │   ├── CodeBlock.tsx
│   │   ├── ShaderEditorSidebar.jsx # Editor panel for GLSL
│   │   ├── ShapeSidebar.jsx     # Side navigation panel
│   │   └── ThreeCanvas.jsx      # WebGL encapsulation and 3D rendering
│   ├── constants/       # Static configuration
│   │   └── shaders.js   # Default shader strings
│   ├── utils/           # Helper functions
│   │   └── geometry.js  # Shape to ThreeJS geometry mapper
│   ├── App.jsx          # Main application layout and state manager
│   └── main.jsx         # App entry point
├── globals.css          # Main Tailwind v4 CSS and theme variables
├── components.json      # shadcn CLI configuration
├── tailwind.config.js   # Legacy/Fallback Tailwind config (Tailwind v4 is primary)
├── vite.config.js       # Vite configuration with strict aliases
└── tsconfig.json        # TypeScript config with explicit baseUrl and paths
```

## 🎨 Working with shadcn/ui

### Non-Standard Path Configuration
The `components.json` is configured to output new components to the root `@shadcn/ui/...` directory. 
- **DO NOT** create or look for components in `src/components/ui`.
- **ALIASES**: Both `vite.config.js` and `tsconfig.json` resolve `@shadcn` to the root-level directory.

### Adding New Components
When adding a new component, use the shadcn CLI:
```bash
npx shadcn@latest add <component-name>
```
The CLI will automatically place the component in `@shadcn/ui/components/ui/` based on `components.json`.

**Commonly Available Components:**
You can add any official shadcn component. Some examples include:
`accordion`, `alert`, `avatar`, `badge`, `button`, `calendar`, `card`, `carousel`, `checkbox`, `collapsible`, `combobox`, `command`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`, `tooltip`.

### Importing Components
Always import from the `@shadcn/` alias rather than relative paths:
```jsx
// ✅ DO THIS
import { Button } from '@shadcn/ui/components/ui/button';
import { cn } from '@shadcn/ui/lib/utils';

// ❌ DO NOT DO THIS
import { Button } from '../components/ui/button';
```

## 💅 Tailwind CSS Configuration (v4)

This project uses **Tailwind CSS v4**. 
- The styling source of truth is `globals.css`, which uses the new `@theme inline` directive instead of relying solely on `tailwind.config.js`.
- If you need to modify design tokens (colors, fonts, radius), add or adjust the CSS variables in `globals.css` immediately under the `@theme inline` block.
- Tailwind v4 scans the project automatically, but legacy `content` scanning arrays still exist in `tailwind.config.js` for fallback tooling compatibility. If you add a new directory containing JSX/TSX, ensure it aligns with the Tailwind scanning rules.

### Phosphor Icons
We use Phosphor React icons instead of Lucide.
```jsx
import { Cube, Sphere } from '@phosphor-icons/react';
```

## 🛠️ TypeScript & Vite Resolution

Because of the non-standard `@shadcn` directory structure, explicit paths are declared:
- **`tsconfig.json`**: `"baseUrl": "."` and `"paths": { "@shadcn/ui/*": ["./@shadcn/ui/*"] }`
- **`vite.config.js`**: `resolve: { alias: { '@shadcn': path.resolve(__dirname, './@shadcn') } }`

If you add a new root directory that needs aliasing, you **must** update both `tsconfig.json` and `vite.config.js` to prevent build failures.

## 🚀 Development Workflow
1. Start the dev server: `npm run dev` (runs on Vite)
2. Build the app: `npm run build` (Watch out for chunk size warnings, but a successful build exits with code 0).
3. If making structural changes (e.g. moving UI components), always run `npm run build` to verify that Vite resolves all aliases correctly. 
