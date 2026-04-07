import React, { useState } from 'react';
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
import { Cube, Sphere, Triangle, Square, Circle, CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';

export const ShapesSidebar = ({ shape, setShape, isOpen, onToggle }) => {
  const [subOpen3d, setSubOpen3d] = useState(true);
  const shapes3d = [
    { id: 'cube', label: 'Cube', description: '1 unit³' },
    { id: 'sphere', label: 'Sphere', description: 'radius 0.7' },
    { id: 'pyramid', label: 'Pyramid', description: 'height 1.2, base 0.8' },
  ];
  const [subOpen2d, setSubOpen2d] = useState(false);
  const shapes2d = [
    { id: 'square', label: 'Square', description: 'side 1' },
    { id: 'circle', label: 'Circle', description: 'radius 0.5' },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="w-64 bg-muted/80 text-foreground">
        <SidebarContent>
          <div className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setSubOpen3d(prev => !prev)} className="font-semibold text-base py-3 flex justify-between items-center" >
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
                          {s.id === 'cube' && <Cube size={16} className='mr-2' />}
                          {s.id === 'sphere' && <Sphere size={16} className='mr-2' />}
                          {s.id === 'pyramid' && <Triangle size={16} className='mr-2' />}
                          <span>{s.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setSubOpen2d(prev => !prev)} className="font-semibold text-base py-3 flex justify-between items-center">
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
                          {s.id === 'square' && <Square size={16} className='mr-2' />}
                          {s.id === 'circle' && <Circle size={16} className='mr-2' />}
                          <span>{s.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};