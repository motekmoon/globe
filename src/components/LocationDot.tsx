import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LocationDotProps {
  position: [number, number, number];
  name: string;
}

const LocationDot: React.FC<LocationDotProps> = ({ position, name }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(0);

  // Animate dot appearance
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Scale up animation
      if (scale < 1) {
        const newScale = Math.min(scale + delta * 3, 1);
        setScale(newScale);
        meshRef.current.scale.setScalar(newScale);
      }
      
      // Pulsing effect
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale * pulseScale);
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.setScalar(scale * 1.5);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial 
        color="#00ff41"
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

export default LocationDot;