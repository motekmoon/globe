import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface LocationLineProps {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
}

const LocationLine: React.FC<LocationLineProps> = ({ start, end, label }) => {
  const lineRef = useRef<THREE.Line>(null);
  const [lineLength, setLineLength] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  // Create line geometry
  const [lineGeometry] = useState(() => 
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...start),
      new THREE.Vector3(...start) // Start with same point for animation
    ])
  );

  // Animate line extension
  useFrame((state, delta) => {
    if (lineRef.current) {
      // Extend line over time
      if (lineLength < 1) {
        const newLength = Math.min(lineLength + delta * 2, 1);
        setLineLength(newLength);
        
        // Calculate current end point
        const currentEnd = [
          start[0] + (end[0] - start[0]) * newLength,
          start[1] + (end[1] - start[1]) * newLength,
          start[2] + (end[2] - start[2]) * newLength
        ];
        
        // Update line geometry
        const positions = lineGeometry.attributes.position.array as Float32Array;
        positions[3] = currentEnd[0];
        positions[4] = currentEnd[1];
        positions[5] = currentEnd[2];
        lineGeometry.attributes.position.needsUpdate = true;
        
        // Show label when line is fully extended
        if (newLength >= 1 && !showLabel) {
          setShowLabel(true);
        }
      }
    }
  });

  return (
    <group>
      <primitive
        ref={lineRef}
        object={
          new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
              color: "#ffffff",
              transparent: true,
              opacity: 0.8,
            })
          )
        }
      />

      {showLabel && (
        <Text
          position={[end[0] * 1.1, end[1] * 1.1, end[2] * 1.1]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          lineHeight={1}
          letterSpacing={0.02}
          textAlign="center"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

export default LocationLine;