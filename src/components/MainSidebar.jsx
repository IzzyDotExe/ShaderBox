import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter
} from '@shadcn/ui/components/ui/sidebar';

export const MainSidebar = ({ children, footer }) => {
  return (
    <SidebarProvider className="min-h-full">
      <Sidebar collapsible="none" className="h-full w-full bg-transparent text-foreground dark">
        <SidebarContent>
          <div className="p-2">
            {children}
          </div>
        </SidebarContent>
        {footer && (
          <SidebarFooter className="p-2 border-t border-white/10">
            {footer}
          </SidebarFooter>
        )}
      </Sidebar>
    </SidebarProvider>
  );
};
