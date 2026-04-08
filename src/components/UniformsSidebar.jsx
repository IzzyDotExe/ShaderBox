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
  { id: 'uCameraPosition', type: 'vec3' }
];

export const UniformsSidebar = ({ setVertexShader, setFragmentShader }) => {
  const [subOpenUniforms, setSubOpenUniforms] = useState(localStorage.getItem("uniformsSub") === "true");

  const prependUniform = (shaderSetter) => {
    return (uniform) => {
      shaderSetter((prev) => {
        const line = `uniform ${uniform.type} ${uniform.id};\n`;
        if (!prev.includes(line.trim())) {
          return line + prev;
        }
        return prev;
      });
    };
  };

  const addUniform = (uniform) => {
    prependUniform(setVertexShader)(uniform);
    prependUniform(setFragmentShader)(uniform);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            const newVal = !subOpenUniforms;
            setSubOpenUniforms(newVal);
            localStorage.setItem("uniformsSub", newVal.toString());
          }}
          className="font-semibold text-base py-3 flex justify-between items-center"
        >
          <span>Uniforms</span>
          {subOpenUniforms ? <CaretDownIcon /> : <CaretUpIcon />}
        </SidebarMenuButton>
        {subOpenUniforms && (
          <SidebarMenuSub>
            {uniformList.map((u) => (
              <SidebarMenuSubItem key={u.id}>
                <SidebarMenuSubButton
                  onClick={() => addUniform(u)}
                  className="hover:bg-accent"
                >
                  <span>{u.id}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
