import { useState } from "react"
import { ArrowElbowDownLeft, FileCode, ArrowsClockwise } from "@phosphor-icons/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@shadcn/ui/components/ui/input-group"

interface CodeBlockProps {
  title?: string
  value: string
  onChange: (value: string) => void
  className: string
}

const CodeBlock = ({
  title = "New File.js",
  value,
  onChange,
  className
}: CodeBlockProps) => {
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  const updateCursorPosition = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const textBeforeCursor = target.value.substring(0, target.selectionEnd)
    const lines = textBeforeCursor.split("\n")
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    })
  }

  return (
    <InputGroup className={`${className || ''} dark w-full bg-background h-full flex-1 flex flex-col`}>
      <InputGroupTextarea 
        className="flex-1 min-h-[300px] w-full font-mono resize-none" 
        placeholder="console.log('Hello, world!');" 
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          updateCursorPosition(e)
        }}
        onClick={updateCursorPosition}
        onKeyUp={updateCursorPosition}
      />
      <InputGroupAddon align="block-end" className="border-t">
        <InputGroupText>Line {cursorPosition.line}, Column {cursorPosition.column}</InputGroupText>
        <InputGroupButton className="ml-auto" size="sm" variant="default">
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
