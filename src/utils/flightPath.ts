import * as THREE from 'three';

// Convert latitude/longitude to 3D coordinates on sphere
export const latLonToVector3 = (lat: number, lng: number, radius: number = 2): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// Create parabolic flight path between two points that flies OVER the globe
export const createParabolicPath = (
  startPoint: THREE.Vector3, 
  endPoint: THREE.Vector3, 
  height: number = 0.5
): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  const segments = 50; // Smoothness of curve
  const globeRadius = 2; // Globe radius
  
  // Calculate distance between points
  const distance = startPoint.distanceTo(endPoint);
  
  // For long distances, we need a much higher arc to clear the globe
  const minArcHeight = Math.max(height, distance * 0.4 + globeRadius * 0.8);
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // Linear interpolation between start and end
    const point = new THREE.Vector3().lerpVectors(startPoint, endPoint, t);
    
    // Calculate the direction from globe center to this point
    const directionFromCenter = point.clone().normalize();
    
    // Add parabolic height that extends outward from the globe center
    const parabolicHeight = minArcHeight * Math.sin(t * Math.PI);
    const finalPoint = point.clone().add(directionFromCenter.multiplyScalar(parabolicHeight));
    
    points.push(finalPoint);
  }
  
  return points;
};

// Sort locations by date and create chronological flight paths
export const createChronologicalPaths = (locations: any[]) => {
  // Filter locations that have date and sort by date
  const locationsWithDates = locations
    .filter(loc => !!loc.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const flightPaths = [];
  
  // Create paths between consecutive locations
  for (let i = 0; i < locationsWithDates.length - 1; i++) {
    const current = locationsWithDates[i];
    const next = locationsWithDates[i + 1];
    
    const startPoint = latLonToVector3(current.latitude, current.longitude);
    const endPoint = latLonToVector3(next.latitude, next.longitude);
    
    flightPaths.push({
      from: current,
      to: next,
      order: i + 1,
      startPoint,
      endPoint,
      pathPoints: createParabolicPath(startPoint, endPoint, 0.3)
    });
  }
  
  return flightPaths;
};

// Color palette for flight paths
export const getFlightPathColor = (index: number): number => {
  const colors = [
    0xff0000, // Red
    0x00ff00, // Green
    0x0000ff, // Blue
    0xffff00, // Yellow
    0xff00ff, // Magenta
    0x00ffff, // Cyan
    0xff8000, // Orange
    0x8000ff, // Purple
  ];
  
  return colors[index % colors.length];
};
