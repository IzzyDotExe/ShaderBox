import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@shadcn/ui/components/ui/dialog";
import { Button } from "@shadcn/ui/components/ui/button";
import CodeBlock from "./CodeBlock";

const SNIPPETS = [
  { label: "Empty", code: "return 0.0;" },
  { label: "Sine Pulse (float)", code: "return (Math.sin(time * 2.0) + 1.0) / 2.0;" },
  { label: "Cos Oscillate (float)", code: "return Math.cos(time * 5.0);" },
  { label: "Circular Motion (vec2)", code: "return new THREE.Vector2(Math.cos(time), Math.sin(time));" },
  { label: "Rainbow RGB (vec3)", code: "return new THREE.Vector3(\n  (Math.sin(time)+1.0)/2.0, \n  (Math.sin(time+2.0)+1.0)/2.0, \n  (Math.sin(time+4.0)+1.0)/2.0\n);" },
  { label: "Mouse Follow (vec2)", code: "// Using mouse uniform directly\nreturn mouse;" }
];

export const EditUniformDialog = ({ editDialog, setEditDialog, newUName, handleSaveCode }) => {
  return (
    <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
      <DialogContent className="dark w-[80vw] sm:max-w-[80vw] h-[80vh] flex flex-col text-white bg-neutral-900 border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <DialogTitle>Edit JS Uniform: {editDialog?.name || newUName || 'New Uniform'}</DialogTitle>
          <select 
            className="text-xs bg-black/40 border border-white/10 rounded px-2 py-1 outline-none"
            onChange={(e) => {
              const code = e.target.value;
              if (code) setEditDialog(prev => ({ ...prev, value: code }));
              e.target.value = "";
            }}
            defaultValue=""
          >
            <option value="" disabled>Insert Snippet...</option>
            {SNIPPETS.map(s => (
              <option key={s.label} value={s.code}>{s.label}</option>
            ))}
          </select>
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
