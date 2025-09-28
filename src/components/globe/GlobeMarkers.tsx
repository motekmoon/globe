import React from 'react';
import MarkerDot from './MarkerDot';
import MarkerLine from './MarkerLine';
import { Location } from '../../lib/supabase';

interface GlobeMarkersProps {
  locations: Location[];
  hiddenLocations: Set<string>;
}

const GlobeMarkers: React.FC<GlobeMarkersProps> = ({ locations, hiddenLocations }) => {
  // Convert lat/lng to 3D coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2.01) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return {
      x: -(radius * Math.sin(phi) * Math.cos(theta)), // Fixed: Added negative sign
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    };
  };

  return (
    <group>
      {locations.map((location) => {
        // Skip rendering if location is hidden
        if (hiddenLocations.has(location.id)) {
          return null;
        }
        
        const position = latLngToVector3(location.latitude, location.longitude);
        return (
          <group key={location.id}>
            <MarkerDot 
              position={[position.x, position.y, position.z]}
              name={location.name}
            />
            <MarkerLine 
              start={[0, 0, 0]}
              end={[position.x, position.y, position.z]}
              label={location.name}
            />
          </group>
        );
      })}
    </group>
  );
};

export default GlobeMarkers;
