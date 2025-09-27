import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface LocationLineProps {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
}

const LocationLine: React.FC<LocationLineProps> = ({ start, end, label }) => {
  const lineRef = useRef<THREE.Line>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [lineLength, setLineLength] = useState(0.1); // Start with a small visible line
  const [showLabel, setShowLabel] = useState(false);

  // Debug: Log when component mounts
  React.useEffect(() => {
    console.log('LocationLine mounted:', { start, end, label });
  }, [start, end, label]);

  // Create line geometry with proper setup
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const points = [
      new THREE.Vector3(...start),
      new THREE.Vector3(...start) // Start with same point for animation
    ];
    geometry.setFromPoints(points);
    return geometry;
  }, [start]);

  // Animate line extension and make text always face camera
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
        
        // Position cylinder at midpoint between start and current end
        const midX = (start[0] + currentEnd[0]) / 2;
        const midY = (start[1] + currentEnd[1]) / 2;
        const midZ = (start[2] + currentEnd[2]) / 2;
        
        lineRef.current.position.set(midX, midY, midZ);
        
        // Calculate distance for scale
        const distance = Math.sqrt(
          Math.pow(currentEnd[0] - start[0], 2) +
          Math.pow(currentEnd[1] - start[1], 2) +
          Math.pow(currentEnd[2] - start[2], 2)
        );
        
        // Scale cylinder to match distance
        lineRef.current.scale.set(1, distance, 1);
        
        // Orient cylinder to point from start to end
        const direction = new THREE.Vector3(
          currentEnd[0] - start[0],
          currentEnd[1] - start[1],
          currentEnd[2] - start[2]
        ).normalize();
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, direction);
        lineRef.current.quaternion.copy(quaternion);
        
        // Show label when line is fully extended
        if (newLength >= 1 && !showLabel) {
          setShowLabel(true);
        }
      }
    }

    // Make text always face the camera (billboarding)
    if (textRef.current && showLabel) {
      // Simple billboarding: make text always face camera
      textRef.current.lookAt(camera.position);
    }
  });

  return (
    <group>
      <mesh ref={lineRef}>
        <cylinderGeometry args={[0.01, 0.01, 1, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {showLabel && (
        <Text
          ref={textRef}
          position={[end[0] * 1.5, end[1] * 1.5, end[2] * 1.5]}
          fontSize={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
          lineHeight={1}
          letterSpacing={0.01}
          textAlign="center"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

export default LocationLine;