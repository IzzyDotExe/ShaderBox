import React, { useRef } from 'react';
import useThree from '../hooks/useThree';

const ThreeCanvas = ({ shape, vertexShader, fragmentShader }) => {
  const mountRef = useRef(null);
  useThree({ mountRef, shape, vertexShader, fragmentShader });
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeCanvas;
