import React, { useState } from 'react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem
} from '@shadcn/ui/components/ui/sidebar';
import { CaretDownIcon, CaretUpIcon, PaintBucket } from '@phosphor-icons/react';

export const SettingsSidebar = ({ bgColor, setBgColor }) => {
  const [subOpen, setSubOpen] = useState(
    localStorage.getItem("settingsSub") !== "false"
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            const newVal = !subOpen;
            setSubOpen(newVal);
            localStorage.setItem("settingsSub", newVal.toString());
          }}
          className="font-semibold text-base py-3 flex justify-between items-center"
        >
          <span>Canvas Settings</span>
          {subOpen ? <CaretDownIcon /> : <CaretUpIcon />}
        </SidebarMenuButton>
        {subOpen && (
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <div className="flex items-center justify-between p-2 pl-4 cursor-pointer hover:bg-accent rounded-md group">
                <div className="flex items-center gap-2">
                  <PaintBucket size={16} />
                  <span className="text-sm">Background</span>
                </div>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => {
                    setBgColor(e.target.value);
                    localStorage.setItem('bgColor', e.target.value);
                  }}
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                />
              </div>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
