import React from 'react';
import LocationDot from './LocationDot';
import LocationLine from './LocationLine';
import { Location } from '../lib/supabase';

interface LocationManagerProps {
  locations: Location[];
}

const LocationManager: React.FC<LocationManagerProps> = ({ locations }) => {
  // Convert lat/lng to 3D coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2.01) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.cos(phi),
      z: radius * Math.sin(phi) * Math.sin(theta)
    };
  };

  return (
    <group>
      {locations.map((location) => {
        const position = latLngToVector3(location.latitude, location.longitude);
        return (
          <group key={location.id}>
            <LocationDot 
              position={[position.x, position.y, position.z]}
              name={location.name}
            />
            <LocationLine 
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

export default LocationManager;