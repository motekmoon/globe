import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
// import * as THREE from 'three';
import { createChronologicalPaths, getFlightPathColor } from '../../utils/flightPath';

interface FlightPathProps {
  locations: any[];
  isEnabled?: boolean;
}

const FlightPath: React.FC<FlightPathProps> = ({ 
  locations, 
  isEnabled = true 
}) => {
  const flightPaths = useMemo(() => {
    if (!isEnabled || !locations || locations.length < 2) {
      return [];
    }
    
    return createChronologicalPaths(locations);
  }, [locations, isEnabled]);

  if (!isEnabled || flightPaths.length === 0) {
    return null;
  }

  return (
    <>
      {flightPaths.map((path, index) => (
        <Line
          key={`flight-path-${index}`}
          points={path.pathPoints}
          color={getFlightPathColor(index)}
          lineWidth={3}
          transparent
          opacity={0.8}
        />
      ))}
    </>
  );
};

export default FlightPath;
