import React from 'react';
import { Input } from "@shadcn/ui/components/ui/input";
import { Button } from "@shadcn/ui/components/ui/button";
import { Code } from "@phosphor-icons/react";

export const AddUniformForm = ({
  newUName, setNewUName,
  newUType, setNewUType,
  newUValue, setNewUValue,
  isAnimated, setIsAnimated,
  setEditDialog,
  handleAddCustomUniform
}) => {
  return (
    <div className="mt-4 px-2 flex flex-col gap-2">
      <div className="text-xs font-semibold text-muted-foreground">Add Custom Uniform</div>
      <Input
        placeholder="Name (e.g. uColor)"
        value={newUName}
        onChange={e => setNewUName(e.target.value)}
        className="h-8 text-xs bg-black/20 border-white/10"
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <select
            value={newUType}
            onChange={e => setNewUType(e.target.value)}
            className="dark flex h-8 w-full rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white"
          >
            <option value="float">float</option>
            <option value="vec2">vec2</option>
            <option value="vec3">vec3</option>
            <option value="vec4">vec4</option>
            <option value="sampler2D">sampler2D (Texture)</option>
          </select>
          <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <input 
              type="checkbox" 
              checked={isAnimated} 
              disabled={newUType === 'sampler2D'}
              onChange={e => setIsAnimated(e.target.checked)} 
              className="accent-white disabled:opacity-50" 
            />
            Animated
          </label>
        </div>
        {newUType === 'sampler2D' ? (
          <Input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                 const reader = new FileReader();
                 reader.onload = (ev) => setNewUValue(ev.target.result);
                 reader.readAsDataURL(file);
              }
            }}
            className="dark h-8 text-xs flex-1 bg-black/20 border-white/10 file:text-white file:text-xs"
          />
        ) : isAnimated ? (
          <Button
            variant="outline"
            onClick={() => setEditDialog({ isNew: true, value: newUValue })}
            className="dark h-8 text-xs w-full bg-black/20 border-white/10 hover:bg-black/40 text-muted-foreground justify-start"
          >
            <Code className="mr-2" />
            {newUValue ? "Edit Uniform Code" : "Write JS Body"}
          </Button>
        ) : (
          <Input
            placeholder="Value (e.g. 1.0, 0.5)"
            value={newUValue}
            onChange={e => setNewUValue(e.target.value)}
            className="dark h-8 text-xs flex-1 bg-black/20 border-white/10"
          />
        )}
      </div>
      <Button 
        onClick={handleAddCustomUniform} 
        className="h-8 w-full text-xs bg-white text-black hover:bg-neutral-200"
      >
        Add Uniform
      </Button>
    </div>
  );
};
