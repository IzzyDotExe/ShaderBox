import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent
} from '@shadcn/ui/components/ui/sidebar';

export const MainSidebar = ({ children }) => {
  return (
    <SidebarProvider>
      <Sidebar className="w-64 bg-muted/80 text-foreground dark">
        <SidebarContent>
          <div className="p-2">
            {children}
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};
