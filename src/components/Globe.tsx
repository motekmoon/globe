import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const Globe: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load NASA Blue Marble world map texture
  const worldMapTexture = useTexture('/nasa-blue-marble.jpg');

  // Three-axis rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate on all three axes for complex motion
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 32]} />
      <meshPhongMaterial 
        map={worldMapTexture}
        color="#ffffff"
        shininess={100}
        transparent={false}
      />
    </mesh>
  );
};

export default Globe;