import React, { useState } from 'react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@shadcn/ui/components/ui/sidebar';
import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { Input } from "@shadcn/ui/components/ui/input";
import { Button } from "@shadcn/ui/components/ui/button";
import { Trash, PencilSimple, Code } from "@phosphor-icons/react";
import CodeBlock from "./CodeBlock";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@shadcn/ui/components/ui/dialog";

const LiveUniformValue = ({ uniform, isBuiltIn = false }) => {
  const spanRef = React.useRef(null);
  
  React.useEffect(() => {
    let animId;
    const name = isBuiltIn ? uniform.id : uniform.name;
    const shouldAnimate = isBuiltIn || uniform.isAnimated;

    const updateVal = () => {
      if (spanRef.current && window.__threeEngine?.uniforms[name]) {
        const val = window.__threeEngine.uniforms[name].value;
        let formatted = val;
        
        if (typeof val === 'number') {
          formatted = val.toFixed(3);
        } else if (val && val.isVector2) {
          formatted = `${val.x.toFixed(2)}, ${val.y.toFixed(2)}`;
        } else if (val && val.isVector3) {
          formatted = `${val.x.toFixed(2)}, ${val.y.toFixed(2)}, ${val.z.toFixed(2)}`;
        } else if (val && val.isVector4) {
          formatted = `${val.x.toFixed(2)}, ${val.y.toFixed(2)}, ${val.z.toFixed(2)}, ${val.w.toFixed(2)}`;
        } else if (val && val.isMatrix3) {
          formatted = `[Mat3]`;
        } else if (val && val.isMatrix4) {
          formatted = `[Mat4]`;
        } else if (val && val.isColor) {
          formatted = `${val.r.toFixed(2)}, ${val.g.toFixed(2)}, ${val.b.toFixed(2)}`;
        }
        
        spanRef.current.textContent = uniform.isAnimated ? `ƒ: ${formatted}` : formatted;
      }
      animId = requestAnimationFrame(updateVal);
    };
    if (shouldAnimate) {
      animId = requestAnimationFrame(updateVal);
    } else {
      if (spanRef.current) spanRef.current.textContent = uniform.value || '0';
    }
    return () => cancelAnimationFrame(animId);
  }, [uniform, isBuiltIn]);

  return <span ref={spanRef} className="opacity-50 text-[10px] w-full truncate text-left font-mono" title={uniform.isAnimated ? "Live evaluated value" : uniform.value} />;
};

const uniformList = [
  { id: 'uTime', type: 'float' },
  { id: 'uResolution', type: 'vec2' },
  { id: 'uMouse', type: 'vec2' },
  { id: 'uDelta', type: 'float' },
  { id: 'uViewMatrix', type: 'mat4' },
  { id: 'uProjectionMatrix', type: 'mat4' },
  { id: 'uNormalMatrix', type: 'mat3' },
  { id: 'uLightDirection', type: 'vec3' },
  { id: 'uLightColor', type: 'vec3' },
  { id: 'uCameraPosition', type: 'vec3' },
  { id: 'uRotation', type: 'vec3' }
];

export const UniformsSidebar = ({ setVertexShader, setFragmentShader, customUniforms, setCustomUniforms }) => {
  const [subOpenUniforms, setSubOpenUniforms] = useState(localStorage.getItem("uniformsSub") === "true");
  
  const [newUName, setNewUName] = useState("");
  const [newUType, setNewUType] = useState("float");
  const [newUValue, setNewUValue] = useState("");
  const [isAnimated, setIsAnimated] = useState(false);

  const [editDialog, setEditDialog] = useState(null);

  const prependUniform = (shaderSetter) => {
    return (uniform) => {
      shaderSetter((prev) => {
        const line = `uniform ${uniform.type} ${uniform.id || uniform.name};\n`;
        if (!prev.includes(line.trim())) {
          return line + prev;
        }
        return prev;
      });
    };
  };

  const addUniformToShader = (uniform) => {
    prependUniform(setVertexShader)(uniform);
    prependUniform(setFragmentShader)(uniform);
  };

  const handleAddCustomUniform = () => {
    if (!newUName) return;
    const newUniform = { name: newUName, type: newUType, value: newUValue, isAnimated };
    setCustomUniforms(prev => [...prev, newUniform]);
    setNewUName("");
    setNewUValue("");
    setIsAnimated(false);
  };

  const handleRemoveCustomUniform = (nameToRemove, e) => {
    e.stopPropagation();
    setCustomUniforms(prev => prev.filter(u => u.name !== nameToRemove));
  };

  const handleSaveCode = () => {
    if (!editDialog) return;
    if (editDialog.isNew) {
      setNewUValue(editDialog.value);
    } else {
      setCustomUniforms(prev => prev.map(u => 
        u.name === editDialog.name ? { ...u, value: editDialog.value } : u
      ));
    }
    setEditDialog(null);
  };

  return (
    <>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            const newVal = !subOpenUniforms;
            setSubOpenUniforms(newVal);
            localStorage.setItem("uniformsSub", newVal.toString());
          }}
          className="dark font-semibold text-base py-3 flex justify-between items-center"
        >
          <span>Uniforms</span>
          {subOpenUniforms ? <CaretDownIcon /> : <CaretUpIcon />}
        </SidebarMenuButton>
        {subOpenUniforms && (
          <SidebarMenuSub>
            {/* Standard Uniforms */}
            <div className="dark text-xs font-semibold px-2 py-1 text-muted-foreground mt-1">Built-in</div>
            {uniformList.map((u) => (
              <SidebarMenuSubItem key={u.id}>
                <SidebarMenuSubButton
                  onClick={() => addUniformToShader({ id: u.id, type: u.type })}
                  className="hover:bg-accent flex-col items-start gap-0 h-auto py-1 justify-center"
                >
                  <span className="truncate w-full text-left">{u.id} <span className="opacity-50 text-[10px]">({u.type})</span></span>
                  <LiveUniformValue uniform={u} isBuiltIn={true} />
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}

            {/* Custom Uniforms List */}
            {customUniforms && customUniforms.length > 0 && (
              <>
                <div className="text-xs font-semibold px-2 py-1 text-muted-foreground mt-4">Custom</div>
                {customUniforms.map((u) => (
                  <SidebarMenuSubItem key={u.name} className="dark flex group items-center pr-2">
                    <SidebarMenuSubButton
                      onClick={() => addUniformToShader(u)}
                      className="hover:bg-accent flex-1 flex-col items-start gap-0 h-auto py-1 justify-center"
                    >
                      <span className="truncate w-full text-left">{u.name} <span className="opacity-50 text-[10px]">({u.type})</span></span>
                      <LiveUniformValue uniform={u} />
                    </SidebarMenuSubButton>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {u.isAnimated && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditDialog({ isNew: false, name: u.name, value: u.value }); }}
                          className="dark text-blue-400 hover:text-blue-300"
                        >
                          <PencilSimple className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleRemoveCustomUniform(u.name, e)}
                        className="dark text-red-400 hover:text-red-300"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </SidebarMenuSubItem>
                ))}
              </>
            )}

            {/* Form to add custom uniform */}
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
                  </select>
                  <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      checked={isAnimated} 
                      onChange={e => setIsAnimated(e.target.checked)} 
                      className="accent-white" 
                    />
                    Animated
                  </label>
                </div>
                {isAnimated ? (
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
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
    <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
      <DialogContent className="dark w-[80vw] sm:max-w-[80vw] h-[80vh] flex flex-col text-white bg-neutral-900 border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>Edit JS Uniform: {editDialog?.name || newUName || 'New Uniform'}</DialogTitle>
        </DialogHeader>
        {editDialog && (
          <div className="flex-1 min-h-0 relative border-y border-white/10 bg-black/40 flex flex-col">
            <CodeBlock 
              className="flex-1 min-h-0 w-full"
              title={`${editDialog?.name || newUName || 'custom'}.js`}
              value={editDialog.value} 
              onChange={(v) => setEditDialog(prev => ({ ...prev, value: v }))} 
            />
          </div>
        )}
        <div className="flex justify-end p-4 pt-2 shrink-0 bg-neutral-900 z-10">
          <Button onClick={handleSaveCode}>Extract & Save</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
