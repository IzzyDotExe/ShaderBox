import React, { useRef, useCallback, useState } from 'react';
import useThree from '../hooks/useThree';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@shadcn/ui/components/ui/dialog";

const ThreeCanvas = ({ shape, vertexShader, fragmentShader, customUniforms }) => {
  const mountRef = useRef(null);
  const [fullError, setFullError] = useState(null);
  
  const handleShaderError = useCallback((errorMsg) => {
    toast("Shader Error", { 
      description: errorMsg.length > 200 ? errorMsg.slice(0, 200) + '...' : errorMsg,
      duration: 5000,
      action: {
        label: "View Full Error",
        onClick: () => setFullError(errorMsg)
      }
    });
  }, []);

  useThree({ 
    mountRef, 
    shape, 
    vertexShader, 
    fragmentShader,
    onError: handleShaderError,
    customUniforms
  });
  
  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <Dialog open={!!fullError} onOpenChange={(open) => !open && setFullError(null)}>
        <DialogContent className="dark sm:max-w-5xl w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Full Shader Error</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <pre className="font-mono text-sm whitespace-pre-wrap p-4 bg-muted rounded-md text-destructive">
              {fullError}
            </pre>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThreeCanvas;
