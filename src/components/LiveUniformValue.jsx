import React from 'react';
import { WarningCircle } from "@phosphor-icons/react";

export const LiveUniformValue = ({ uniform, isBuiltIn = false, onUniformUpdate }) => {
  const spanRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const hasDraggedRef = React.useRef(false);
  
  React.useEffect(() => {
    let animId;
    const name = isBuiltIn ? uniform.id : uniform.name;
    const shouldAnimate = isBuiltIn || uniform.isAnimated;

    const updateVal = () => {
      if (spanRef.current && window.__threeEngine?.uniforms[name]) {
        const err = window.__threeEngine?.uniformErrors?.[name];
        if (err !== errorMsg) setErrorMsg(err);

        const val = window.__threeEngine.uniforms[name].value;
        let formatted = val;
        
        if (typeof val === 'number') {
          formatted = val.toFixed(3);
        } else if (val && val.isVector2) {
          formatted = `${val.x.toFixed(2)}, ${val.y.toFixed(2)}`;
        } else if (val && val.isVector3) {
          formatted = `${val.x.toFixed(2)}, ${val.y.toFixed(2)}, ${val.z.toFixed(2)}`;
        } else if (val && val.isVector4) {
          formatted = `${val.x.toFixed(2)}, ${val.y.toFixed(2)}, ${val.z.toFixed(2)}, ${val.w.toFixed(2)}`;
        } else if (val && val.isMatrix3) {
          formatted = `[Mat3]`;
        } else if (val && val.isMatrix4) {
          formatted = `[Mat4]`;
        } else if (val && val.isColor) {
          formatted = `${val.r.toFixed(2)}, ${val.g.toFixed(2)}, ${val.b.toFixed(2)}`;
        } else if (uniform.type === 'sampler2D') {
          formatted = `[Texture]`;
        }
        
        spanRef.current.textContent = uniform.isAnimated ? `ƒ: ${formatted}` : formatted;
      }
      animId = requestAnimationFrame(updateVal);
    };
    if (shouldAnimate) {
      animId = requestAnimationFrame(updateVal);
    } else {
      if (spanRef.current) spanRef.current.textContent = uniform.type === 'sampler2D' ? '[Texture]' : (uniform.value || '0');
    }
    return () => cancelAnimationFrame(animId);
  }, [uniform, isBuiltIn, errorMsg]);

  // Drag to scrub for static floats
  React.useEffect(() => {
    if (isBuiltIn || uniform.isAnimated || uniform.type !== 'float') return;
    
    let isDragging = false;
    let startX = 0;
    let startVal = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      hasDraggedRef.current = false;
      startX = e.clientX;
      startVal = parseFloat(window.__threeEngine?.uniforms[uniform.name]?.value || uniform.value || 0);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.stopPropagation();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) hasDraggedRef.current = true;
      // sensitivity factor
      let newVal = startVal + (dx * 0.01);
      
      if (window.__threeEngine?.uniforms[uniform.name]) {
         window.__threeEngine.uniforms[uniform.name].value = newVal;
      }
      if (spanRef.current) spanRef.current.textContent = newVal.toFixed(3);
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
      // Sync React state lazily 
      if (spanRef.current && onUniformUpdate) {
         onUniformUpdate(uniform.name, parseFloat(spanRef.current.textContent));
      }
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      if (el) el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = '';
    };
  }, [uniform, isBuiltIn, onUniformUpdate]);

  const isColor = !uniform.isAnimated && ['vec3','vec4'].includes(uniform.type) && uniform.name?.toLowerCase().includes('color');
  const isScrubbable = !isBuiltIn && !uniform.isAnimated && uniform.type === 'float';

  return (
    <div 
      ref={containerRef} 
      className={`flex items-center gap-2 w-full min-w-0 ${isScrubbable ? 'select-none' : ''}`} 
      title={errorMsg || (uniform.isAnimated ? "Live evaluated value" : "Drag to scrub (float)")}
      onClick={(e) => {
        if (hasDraggedRef.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      {isColor && (
        <input 
          type="color" 
          className="w-4 h-4 p-0 border-0 rounded cursor-pointer shrink-0" 
          defaultValue="#ffffff" // We'd ideally parse the vec3 to hex here, keeping it simple for now
          onChange={(e) => {
             // Convert hex to vec3
             const hex = e.target.value;
             const r = parseInt(hex.slice(1,3), 16)/255;
             const g = parseInt(hex.slice(3,5), 16)/255;
             const b = parseInt(hex.slice(5,7), 16)/255;
             if (window.__threeEngine?.uniforms[uniform.name]) {
               window.__threeEngine.uniforms[uniform.name].value.set(r,g,b);
               if (onUniformUpdate) {
                  onUniformUpdate(uniform.name, `${r},${g},${b}`);
               }
             }
          }}
          onClick={e => e.stopPropagation()}
        />
      )}
      <span 
        ref={spanRef} 
        className={`opacity-50 text-[10px] w-full truncate text-left font-mono ${errorMsg ? 'text-red-400 opacity-100' : ''} ${isScrubbable ? 'cursor-ew-resize hover:opacity-100 select-none' : ''}`} 
      />
      {errorMsg && <WarningCircle className="text-red-400 shrink-0 w-3 h-3" />}
    </div>
  );
};
