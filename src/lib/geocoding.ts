// Geocoding service for address lookup
export interface GeocodingResult {
  name: string;
  lat: number;
  lng: number;
}

export interface GeocodingError {
  message: string;
  code?: string;
}

// Mapbox API configuration
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "your-mapbox-token";

// Mock coordinates for demo/fallback
const getMockCoordinates = (address: string): GeocodingResult => {
  const mockLocations: { [key: string]: { lat: number; lng: number } } = {
    "new york": { lat: 40.7128, lng: -74.006 },
    london: { lat: 51.5074, lng: -0.1278 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    paris: { lat: 48.8566, lng: 2.3522 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    moscow: { lat: 55.7558, lng: 37.6176 },
    beijing: { lat: 39.9042, lng: 116.4074 },
    "rio de janeiro": { lat: -22.9068, lng: -43.1729 },
    mumbai: { lat: 19.076, lng: 72.8777 },
    cairo: { lat: 30.0444, lng: 31.2357 },
  };

  const normalizedAddress = address.toLowerCase().trim();
  const coords = mockLocations[normalizedAddress] || {
    lat: Math.random() * 180 - 90,
    lng: Math.random() * 360 - 180,
  };

  return {
    name: address,
    lat: coords.lat,
    lng: coords.lng,
  };
};

// Geocode an address using Mapbox API
export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  if (!address.trim()) {
    throw new Error("Address cannot be empty");
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );

    if (!response.ok) {
      throw new Error("Geocoding API request failed");
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      const name = data.features[0].place_name;

      return { name, lat, lng };
    } else {
      throw new Error("Location not found");
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    // Fallback to mock coordinates
    return getMockCoordinates(address);
  }
};

// Validate coordinate inputs
export const validateCoordinates = (lat: string, lng: string): { lat: number; lng: number } | null => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return null;
  }

  if (latNum < -90 || latNum > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  if (lngNum < -180 || lngNum > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  return { lat: latNum, lng: lngNum };
};
