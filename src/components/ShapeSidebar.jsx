import React, { useState, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@shadcn/ui/components/ui/sidebar';
import { CubeIcon, SphereIcon, TriangleIcon, SquareIcon, CircleIcon, CaretDownIcon, CaretUpIcon, CylinderIcon, CircleDashedIcon, HexagonIcon, TrafficConeIcon } from '@phosphor-icons/react';

export const ShapesSidebar = ({ shape, setShape, isOpen, onToggle, children}) => {
  const [subOpen3d, setSubOpen3d] = useState(localStorage.getItem("3dSub") !== "false");
  const shapes3d = [
    { id: 'cube', label: 'Cube', description: '1 unit³' },
    { id: 'sphere', label: 'Sphere', description: 'radius 0.7' },
    { id: 'pyramid', label: 'Pyramid', description: 'height 1.2, base 0.8' },
    { id: 'torus', label: 'Torus', description: 'radius 0.5' },
    { id: 'cylinder', label: 'Cylinder', description: 'radius 0.5' },
    { id: 'cone', label: 'Cone', description: 'height 1.2' },
    { id: 'icosahedron', label: 'Icosahedron', description: 'radius 0.7' },
  ];
  const [subOpen2d, setSubOpen2d] = useState(localStorage.getItem("2dSub") !== "false");
  const shapes2d = [
    { id: 'square', label: 'Square', description: 'side 1' },
    { id: 'circle', label: 'Circle', description: 'radius 0.5' },
    { id: 'ring', label: 'Ring', description: 'radius 0.3-0.7' },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
                <SidebarMenuButton onClick={() => {
                  const newVal = !subOpen3d;
                  setSubOpen3d(newVal);
                  localStorage.setItem("3dSub", newVal.toString());
                }} className="font-semibold text-base py-3 flex justify-between items-center" >
                  <span>3D Shapes</span>
                  {subOpen3d && <CaretDownIcon />}
                  {!subOpen3d && <CaretUpIcon />}
                </SidebarMenuButton>
                {subOpen3d && (
                  <SidebarMenuSub>
                    {shapes3d.map((s) => (
                      <SidebarMenuSubItem key={s.id}>
                        <SidebarMenuSubButton
                          isActive={shape === s.id}
                          onClick={() => setShape(s.id)}
                          className={shape === s.id ? 'bg-accent' : ''}
                        >
                          {s.id === 'cube' && <CubeIcon size={16} className='mr-2' />}
                          {s.id === 'sphere' && <SphereIcon size={16} className='mr-2' />}
                          {s.id === 'pyramid' && <TriangleIcon size={16} className='mr-2' />}
                          {s.id === 'torus' && <CircleDashedIcon size={16} className='mr-2' />}
                          {s.id === 'cylinder' && <CylinderIcon size={16} className='mr-2' />}
                          {s.id === 'cone' && <TrafficConeIcon size={16} className='mr-2' />}
                          {s.id === 'icosahedron' && <HexagonIcon size={16} className='mr-2' />}
                          <span>{s.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => {
                  const newVal = !subOpen2d;
                  setSubOpen2d(newVal);
                  localStorage.setItem("2dSub", newVal.toString());
                }} className="font-semibold text-base py-3 flex justify-between items-center">
                  <span>2D Shapes</span>
                  {subOpen2d && <CaretDownIcon />}
                  {!subOpen2d && <CaretUpIcon />}
                </SidebarMenuButton>
                {subOpen2d && (
                  <SidebarMenuSub>
                    {shapes2d.map((s) => (
                      <SidebarMenuSubItem key={s.id}>
                        <SidebarMenuSubButton
                          isActive={shape === s.id}
                          onClick={() => setShape(s.id)}
                          className={shape === s.id ? 'bg-accent' : ''}
                        >
                          {s.id === 'square' && <SquareIcon size={16} className='mr-2' />}
                          {s.id === 'circle' && <CircleIcon size={16} className='mr-2' />}
                          {s.id === 'ring' && <CircleDashedIcon size={16} className='mr-2' />}
                          <span>{s.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
  );
};