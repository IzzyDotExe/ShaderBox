import React, { useState } from 'react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@shadcn/ui/components/ui/sidebar';
import { CaretDownIcon, CaretUpIcon, Trash, PencilSimple } from '@phosphor-icons/react';
import { LiveUniformValue } from "./LiveUniformValue";
import { BUILT_IN_UNIFORMS as uniformList } from "../constants/uniforms";
import { AddUniformForm } from "./AddUniformForm";
import { EditUniformDialog } from "./EditUniformDialog";

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
                      <LiveUniformValue uniform={u} onUniformUpdate={(name, val) => {
                         setCustomUniforms(prev => prev.map(cu => cu.name === name ? { ...cu, value: String(val) } : cu));
                      }} />
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
            <AddUniformForm
              newUName={newUName} setNewUName={setNewUName}
              newUType={newUType} setNewUType={setNewUType}
              newUValue={newUValue} setNewUValue={setNewUValue}
              isAnimated={isAnimated} setIsAnimated={setIsAnimated}
              setEditDialog={setEditDialog}
              handleAddCustomUniform={handleAddCustomUniform}
            />
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
    <EditUniformDialog 
      editDialog={editDialog} 
      setEditDialog={setEditDialog} 
      newUName={newUName} 
      handleSaveCode={handleSaveCode} 
    />
    </>
  );
};
