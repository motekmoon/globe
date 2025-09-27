import React, { useRef, useMemo } from 'react';
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

  // Create greyscale shader material
  const greyscaleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        texture: { value: worldMapTexture }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D texture;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(texture, vUv);
          // Convert to greyscale using luminance formula
          float grey = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          gl_FragColor = vec4(vec3(grey), color.a);
        }
      `
    });
  }, [worldMapTexture]);

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
        <primitive object={greyscaleMaterial} />
      </mesh>
      <LocationManager locations={locations} />
    </group>
  );
};

export default Globe;