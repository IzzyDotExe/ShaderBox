import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shadcn/ui/components/ui/dialog";
import { Button } from "@shadcn/ui/components/ui/button";
import CodeBlock from "./CodeBlock";

export const EditUniformDialog = ({ editDialog, setEditDialog, newUName, handleSaveCode }) => {
  return (
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
  );
};
