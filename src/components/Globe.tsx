import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import LocationManager from "./LocationManager";
import { Location } from "../lib/supabase";

interface GlobeProps {
  locations: Location[];
}

const Globe: React.FC<GlobeProps> = ({ locations }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Load NASA Blue Marble world map texture
  const worldMapTexture = useTexture("/nasa-blue-marble.jpg");

  // Three-axis rotation animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate on all three axes for complex motion
      groupRef.current.rotation.x += delta * 0.1;
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 32]} />
        <meshPhongMaterial
          map={worldMapTexture}
          color="#ffffff"
          shininess={100}
          transparent={false}
        />
      </mesh>
      <LocationManager locations={locations} />
    </group>
  );
};

export default Globe;