import React from 'react';
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

export const ShapesSidebar = ({ shape, setShape }) => {
  const shapes = [
    { id: 'cube', label: 'Cube', description: '1 unit³' },
    { id: 'sphere', label: 'Sphere', description: 'radius 0.7' },
    { id: 'pyramid', label: 'Pyramid', description: 'height 1.2, base 0.8' },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="w-64 bg-muted/80 text-foreground">
        <SidebarContent>
          <div className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="font-semibold text-base py-3">
                  <span>Shapes</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {shapes.map((s) => (
                    <SidebarMenuSubItem key={s.id}>
                      <SidebarMenuSubButton
                        isActive={shape === s.id}
                        onClick={() => setShape(s.id)}
                        className={shape === s.id ? 'bg-accent' : ''}
                      >
                        <span>{s.label}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{s.description}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};