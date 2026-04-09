import React from 'react';

export const LiveUniformValue = ({ uniform, isBuiltIn = false }) => {
  const spanRef = React.useRef(null);
  
  React.useEffect(() => {
    let animId;
    const name = isBuiltIn ? uniform.id : uniform.name;
    const shouldAnimate = isBuiltIn || uniform.isAnimated;

    const updateVal = () => {
      if (spanRef.current && window.__threeEngine?.uniforms[name]) {
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
        }
        
        spanRef.current.textContent = uniform.isAnimated ? `ƒ: ${formatted}` : formatted;
      }
      animId = requestAnimationFrame(updateVal);
    };
    if (shouldAnimate) {
      animId = requestAnimationFrame(updateVal);
    } else {
      if (spanRef.current) spanRef.current.textContent = uniform.value || '0';
    }
    return () => cancelAnimationFrame(animId);
  }, [uniform, isBuiltIn]);

  return <span ref={spanRef} className="opacity-50 text-[10px] w-full truncate text-left font-mono" title={uniform.isAnimated ? "Live evaluated value" : uniform.value} />;
};
