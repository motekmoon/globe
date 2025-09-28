import React from 'react';
import QuantityLine from './QuantityLine';
import { Location } from '../../lib/supabase';

interface QuantityMarkersProps {
  locations: Location[];
  hiddenLocations: Set<string>;
}

const QuantityMarkers: React.FC<QuantityMarkersProps> = ({ locations, hiddenLocations }) => {
  // Convert lat/lng to 3D coordinates on sphere (same as GlobeMarkers)
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2.01) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return {
      x: -(radius * Math.sin(phi) * Math.cos(theta)),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    };
  };

  // Calculate direction vector from center to surface point
  const getDirectionVector = (position: { x: number; y: number; z: number }) => {
    const magnitude = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
    return [
      position.x / magnitude,
      position.y / magnitude,
      position.z / magnitude,
    ] as [number, number, number];
  };

  return (
    <group>
      {locations.map((location) => {
        // Skip rendering if location is hidden or has no quantity
        if (hiddenLocations.has(location.id) || !location.quantity) {
          return null;
        }
        
        const position = latLngToVector3(
          location.latitude || 0,
          location.longitude || 0
        );
        const direction = getDirectionVector(position);

        return (
          <QuantityLine
            key={`quantity-${location.id}`}
            start={[position.x, position.y, position.z]}
            direction={direction}
            label={location.name || "Unknown"}
            quantity={location.quantity}
          />
        );
      })}
    </group>
  );
};

export default QuantityMarkers;
