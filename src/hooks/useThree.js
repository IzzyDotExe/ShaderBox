import { useEffect, useRef } from 'react';
import { ThreeEngine } from '../utils/ThreeEngine';

const useThree = ({ mountRef, shape, vertexShader, fragmentShader }) => {
  const engineRef = useRef(null);

  // Scene initialization
  useEffect(() => {
    if (!mountRef.current) return;
    
    engineRef.current = new ThreeEngine(
      mountRef.current, 
      shape, 
      vertexShader, 
      fragmentShader
    );
    
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Shader updates
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateShaders(vertexShader, fragmentShader);
    }
  }, [vertexShader, fragmentShader]);

  // Shape updates
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateShape(shape);
    }
  }, [shape]);
};

export default useThree;
