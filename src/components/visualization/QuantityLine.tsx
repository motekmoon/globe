import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface QuantityLineProps {
  start: [number, number, number]; // Dot position (surface of globe)
  direction: [number, number, number]; // Direction vector from center to dot
  label: string;
  quantity?: number; // Value to determine line length
  scaledQuantity?: number; // Pre-scaled quantity value (optional)
}

const QuantityLine: React.FC<QuantityLineProps> = ({
  start,
  direction,
  label,
  quantity = 1,
  scaledQuantity,
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [lineLength, setLineLength] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  // Calculate line length based on quantity (use scaled value if provided)
  const effectiveQuantity =
    scaledQuantity !== undefined ? scaledQuantity : quantity;
  const normalizedQuantity = Math.max(
    0.2,
    Math.min(2.5, (effectiveQuantity || 1) / 50)
  );
  const targetLength = normalizedQuantity;

  // Create line geometry - starts at dot position, extends outward
  const [lineGeometry] = useState(() =>
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...start), // Start at dot position
      new THREE.Vector3(...start), // Will be updated to extend outward
    ])
  );

  // Animate line extension and make text always face camera
  useFrame((state, delta) => {
    if (lineRef.current) {
      // Extend line over time based on quantity
      if (lineLength < targetLength) {
        const newLength = Math.min(lineLength + delta * 2, targetLength);
        setLineLength(newLength);

        // Calculate current end point - extend from dot outward
        const currentEnd = [
          start[0] + direction[0] * newLength,
          start[1] + direction[1] * newLength,
          start[2] + direction[2] * newLength,
        ];

        // Update line geometry
        const positions = lineGeometry.attributes.position
          .array as Float32Array;
        positions[3] = currentEnd[0];
        positions[4] = currentEnd[1];
        positions[5] = currentEnd[2];
        lineGeometry.attributes.position.needsUpdate = true;

        // Show label when line is fully extended
        if (newLength >= targetLength && !showLabel) {
          setShowLabel(true);
        }
      }
    }

    // Make text always face the camera (billboarding)
    if (textRef.current && showLabel) {
      textRef.current.lookAt(camera.position);
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
              color: "#00ff88", // Green color to distinguish from location lines
              transparent: true,
              opacity: 0.9,
            })
          )
        }
      />

      {showLabel && (
        <Text
          ref={textRef}
          position={[
            start[0] + direction[0] * targetLength,
            start[1] + direction[1] * targetLength,
            start[2] + direction[2] * targetLength,
          ]}
          fontSize={0.04}
          color="#00ff88"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.5}
          lineHeight={1}
          letterSpacing={0.01}
          textAlign="center"
        >
          {label} ({quantity})
        </Text>
      )}
    </group>
  );
};

export default QuantityLine;

