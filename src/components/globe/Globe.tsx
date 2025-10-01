import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import GlobeMarkers from './GlobeMarkers';
import QuantityVisualization from "../visualization/QuantityVisualization";
import FlightPath from "./FlightPath";
import { Location } from "../../lib/supabase";

interface GlobeProps {
  locations: Location[];
  hiddenLocations: Set<string>;
  isPlaying?: boolean;
  showQuantityVisualization?: boolean; // New prop to toggle quantity visualization
  columnMapping?: { [key: string]: string }; // Column mapping for flight paths
}

const Globe: React.FC<GlobeProps> = ({
  locations,
  hiddenLocations,
  isPlaying = true,
  showQuantityVisualization = false,
  columnMapping = {},
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Load NASA Blue Marble world map texture
  const worldMapTexture = useTexture("/nasa-blue-marble.jpg");

  // Check if any column is mapped to flightPath
  const showFlightPaths = Object.values(columnMapping).includes("flightPath");

  // Three-axis rotation animation (only when playing)
  useFrame((state, delta) => {
    if (groupRef.current && isPlaying) {
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
          shininess={50}
          transparent={false}
          emissive="#333333"
          emissiveIntensity={0.3}
          onBeforeCompile={(shader) => {
            // Apply grayscale filter only to the globe
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <output_fragment>",
              `
              #include <output_fragment>
              
              // Apply grayscale filter to globe only
              float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
              gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(gray), 0.8);
              `
            );
          }}
        />
      </mesh>
      <GlobeMarkers
        locations={locations}
        hiddenLocations={hiddenLocations}
        showQuantityVisualization={showQuantityVisualization}
      />
      <QuantityVisualization
        locations={locations}
        hiddenLocations={hiddenLocations}
        isEnabled={showQuantityVisualization}
      />
      <FlightPath locations={locations} isEnabled={showFlightPaths} />
    </group>
  );
};

export default Globe;
