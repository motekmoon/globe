import React from 'react';
import QuantityMarkers from './QuantityMarkers';
import { Location } from '../../lib/supabase';

interface QuantityVisualizationProps {
  locations: Location[];
  hiddenLocations: Set<string>;
  isEnabled?: boolean; // Toggle for enabling/disabling quantity visualization
}

const QuantityVisualization: React.FC<QuantityVisualizationProps> = ({ 
  locations, 
  hiddenLocations, 
  isEnabled = true 
}) => {
  // Don't render anything if disabled
  if (!isEnabled) {
    return null;
  }

  return (
    <QuantityMarkers 
      locations={locations} 
      hiddenLocations={hiddenLocations} 
    />
  );
};

export default QuantityVisualization;

