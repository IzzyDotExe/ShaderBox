import React from 'react'
import CodeBlock from './CodeBlock'

const ShaderEditorSidebar = ({
  vertexShader,
  setVertexShader,
  fragmentShader,
  setFragmentShader,
  onRunShaders
}) => {
  return (
    <div className='flex flex-col align-middle justify-center' style={{ width: 550, backgroundColor: 'rgba(34,34,34,.8)', color: '#fff', padding: 20, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <CodeBlock 
        className='my-6' 
        title="vertexShader.glsl" 
        value={vertexShader} 
        onChange={setVertexShader} 
        onRun={onRunShaders} 
      />
      <CodeBlock 
        className='my-6' 
        title="fragmentShader.glsl" 
        value={fragmentShader} 
        onChange={setFragmentShader} 
        onRun={onRunShaders} 
      />
    </div>
  )
}

export default ShaderEditorSidebar
