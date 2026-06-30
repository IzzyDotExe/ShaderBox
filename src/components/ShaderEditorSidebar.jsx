import React, { useState } from 'react'
import CodeBlock from './CodeBlock'
import { Button } from "@shadcn/ui/components/ui/button"
import { FileCode } from "@phosphor-icons/react"

const ShaderEditorSidebar = ({
  vertexShader,
  setVertexShader,
  fragmentShader,
  setFragmentShader,
  onResetShaders,
  onRunShaders
}) => {
  const [activeTab, setActiveTab] = useState('vertex')

  const tabClass = (tab) =>
    `flex-1 text-xs ${activeTab === tab
      ? 'bg-white/10 border-white/30 text-white hover:bg-white/15'
      : 'bg-black/20 border-white/10 text-muted-foreground hover:bg-black/40'}`

  return (
    <div className='dark flex flex-col overflow-hidden' style={{ width: 550, height: '100%', backgroundColor: 'rgba(34,34,34,.8)', color: '#fff', padding: 20, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div className="flex gap-1 mb-4 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('vertex')}
          className={tabClass('vertex')}
        >
          <FileCode className="mr-1" /> Vertex
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('fragment')}
          className={tabClass('fragment')}
        >
          <FileCode className="mr-1" /> Fragment
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'vertex' ? (
          <CodeBlock
            className=""
            title="vertexShader.glsl"
            value={vertexShader}
            onChange={setVertexShader}
            onRun={onRunShaders}
            onReset={onResetShaders}
          />
        ) : (
          <CodeBlock
            className=""
            title="fragmentShader.glsl"
            value={fragmentShader}
            onChange={setFragmentShader}
            onRun={onRunShaders}
            onReset={onResetShaders}
          />
        )}
      </div>
    </div>
  )
}

export default ShaderEditorSidebar
