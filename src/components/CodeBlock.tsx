import { useState } from "react"
import { ArrowElbowDownLeft, FileCode, ArrowsClockwise } from "@phosphor-icons/react"
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-glsl';
import 'prismjs/themes/prism-tomorrow.css';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "@shadcn/ui/components/ui/input-group"

interface CodeBlockProps {
  title?: string
  value: string
  onChange: (value: string) => void
  onRun?: () => void
  className: string
}

const CodeBlock = ({
  title = "New File.js",
  value,
  onChange,
  onRun,
  className
}: CodeBlockProps) => {
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  const updateCursorPosition = (e: any) => {
    const target = e.target as HTMLTextAreaElement
    if (!target) return;
    const textBeforeCursor = target.value.substring(0, target.selectionEnd || 0)
    const lines = textBeforeCursor.split("\n")
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    })
  }

  return (
    <InputGroup className={`${className || ''} dark w-full bg-background h-full flex-1 flex flex-col`}>
      <div className="flex-1 w-full min-h-[300px] overflow-auto relative rounded-none border-0 bg-transparent py-2 shadow-none ring-0">
        <Editor
          value={value}
          onValueChange={(code) => onChange(code)}
          highlight={code => Prism.highlight(code, Prism.languages.glsl, 'glsl')}
          padding={15}
          className="font-mono text-sm w-full min-h-[300px] text-foreground focus-visible:ring-0"
          textareaClassName="focus:outline-none"
          style={{
            fontFamily: '"JetBrains Mono Variable", monospace',
            backgroundColor: 'transparent'
          }}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
        />
      </div>
      <InputGroupAddon align="block-end" className="border-t">
        <InputGroupText>Line {cursorPosition.line}, Column {cursorPosition.column}</InputGroupText>
        <InputGroupButton onClick={onRun} className="ml-auto" size="sm" variant="default">
          Run
          <ArrowElbowDownLeft />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupAddon align="block-start" className="border-b">
        <InputGroupText className="font-medium font-mono">
          <FileCode />
          {title}
        </InputGroupText>
        <InputGroupButton className="ml-auto" size="icon-xs">
          <ArrowsClockwise />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export default CodeBlock;
