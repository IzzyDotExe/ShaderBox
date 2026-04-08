import React, { useState, useEffect } from 'react'
import { MainSidebar } from './components/MainSidebar'
import { ShapesSidebar } from './components/ShapeSidebar'
import { SettingsSidebar } from './components/SettingsSidebar'
import ThreeCanvas from './components/ThreeCanvas'
import ShaderEditorSidebar from './components/ShaderEditorSidebar'
import { Button } from "@shadcn/ui/components/ui/button"

import { defaultVertexShader, defaultFragmentShader } from './constants/shaders'
import { UniformsSidebar } from './components/UniformsSidebar'

const App = () => {
  const [shape, setShape] = useState(() => localStorage.getItem('shape') || 'cube');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [bgColor, setBgColor] = useState(() => localStorage.getItem('bgColor') || '#111111');
   
  const [editorVertexShader, setEditorVertexShader] = useState(() => {
    const saved = localStorage.getItem('vertexShader');
    return saved || defaultVertexShader;
  });
      const [editorFragmentShader, setEditorFragmentShader] = useState(() => {
    const saved = localStorage.getItem('fragmentShader');
    return saved || defaultFragmentShader;
  });
   
  const [activeVertexShader, setActiveVertexShader] = useState(defaultVertexShader);
  const [activeFragmentShader, setActiveFragmentShader] = useState(defaultFragmentShader);
 
  const handleRunShaders = () => {
    setActiveVertexShader(editorVertexShader);
    setActiveFragmentShader(editorFragmentShader);
  };
 
  // Persist shader changes to localStorage
  useEffect(() => {
    localStorage.setItem('shape', shape);
  }, [shape]);

  useEffect(() => {
    localStorage.setItem('vertexShader', editorVertexShader);
  }, [editorVertexShader]);
  useEffect(() => {
    localStorage.setItem('fragmentShader', editorFragmentShader);
  }, [editorFragmentShader]);
 
  // Reset shaders to defaults
  const handleResetShaders = () => {
    setEditorVertexShader(defaultVertexShader);
    setEditorFragmentShader(defaultFragmentShader);
    localStorage.setItem('vertexShader', defaultVertexShader);
    localStorage.setItem('fragmentShader', defaultFragmentShader);
  };
 
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {sidebarOpen && (
        <div style={{ width: 250, backgroundColor: 'rgba(34,34,34,.8)', color: '#fff', padding: 20, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
          <MainSidebar>
            <SettingsSidebar bgColor={bgColor} setBgColor={setBgColor} />
            <ShapesSidebar shape={shape} setShape={setShape} />
            <UniformsSidebar
              setVertexShader={setEditorVertexShader}
              setFragmentShader={setEditorFragmentShader}
            />
          </MainSidebar>
        </div>
      )}
       
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', position: 'relative', backgroundColor: bgColor, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
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
          onResetShaders={handleResetShaders}
        />
      )}
    </div>
  ) 
}

export default App