import React, { useState } from 'react'
import { ShapesSidebar } from './components/ShapeSidebar'
import ThreeCanvas from './components/ThreeCanvas'
import ShaderEditorSidebar from './components/ShaderEditorSidebar'
import { Button } from "@shadcn/ui/components/ui/button"

import { defaultVertexShader, defaultFragmentShader } from './constants/shaders'

const App = () => {
  const [shape, setShape] = useState('cube');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  const [editorVertexShader, setEditorVertexShader] = useState(defaultVertexShader);
  const [editorFragmentShader, setEditorFragmentShader] = useState(defaultFragmentShader);
  
  const [activeVertexShader, setActiveVertexShader] = useState(defaultVertexShader);
  const [activeFragmentShader, setActiveFragmentShader] = useState(defaultFragmentShader);

  const handleRunShaders = () => {
    setActiveVertexShader(editorVertexShader);
    setActiveFragmentShader(editorFragmentShader);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {sidebarOpen && (
        <div style={{ width: 250, backgroundColor: 'rgba(34,34,34,.8)', color: '#fff', padding: 20, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
          <ShapesSidebar shape={shape} setShape={setShape} />
        </div>
      )}
      
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(17,17,17,.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
        <Button 
          onClick={() => setSidebarOpen(prev => !prev)} 
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, color: '#fff', margin: '4px' }}
        >
          {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        </Button>
        <Button 
          onClick={() => setRightSidebarOpen(prev => !prev)} 
          style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 10, color: '#fff', margin: '4px' }}
        >
          {rightSidebarOpen ? 'Hide Editor' : 'Show Editor'}
        </Button>
        
        <ThreeCanvas 
          shape={shape} 
          vertexShader={activeVertexShader} 
          fragmentShader={activeFragmentShader} 
        />
      </div>

      {rightSidebarOpen && (
        <ShaderEditorSidebar 
          vertexShader={editorVertexShader}
          setVertexShader={setEditorVertexShader}
          fragmentShader={editorFragmentShader}
          setFragmentShader={setEditorFragmentShader}
          onRunShaders={handleRunShaders}
        />
      )}
    </div>
  ) 
}

export default App
