import React, { useState } from 'react';
import { Box, HStack, Input, Button, Text } from "@chakra-ui/react";

interface LocationInputProps {
  onLocationAdd?: (location: {
    name: string;
    lat: number;
    lng: number;
  }) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationAdd }) => {
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);

    try {
      // Use Mapbox Geocoding API
      const MAPBOX_TOKEN =
        "pk.eyJ1IjoibHVtaWFyaWEiLCJhIjoiY2o4b25kbzYyMDVucTMzcnp2emxhMG1sYiJ9.4V9px9CLMCy6oyNWtKWb6A"; // Replace with your token
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const name = data.features[0].place_name;

        if (onLocationAdd) {
          onLocationAdd({ name, lat, lng });
        }
        setAddress("");
      } else {
        throw new Error("Location not found");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      // Fallback to mock coordinates
      const mockCoords = getMockCoordinates(address);
      if (onLocationAdd) {
        onLocationAdd({
          name: address,
          lat: mockCoords.lat,
          lng: mockCoords.lng,
        });
      }
      setAddress("");
    }

    setIsLoading(false);
  };

  const handleCoordinateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!isNaN(latNum) && !isNaN(lngNum)) {
      if (onLocationAdd) {
        onLocationAdd({
          name: `${latNum.toFixed(2)}, ${lngNum.toFixed(2)}`,
          lat: latNum,
          lng: lngNum,
        });
      }
      setLat("");
      setLng("");
    }
  };

  // Mock coordinates for demo
  const getMockCoordinates = (
    address: string
  ): { lat: number; lng: number } => {
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
    return (
      mockLocations[normalizedAddress] || {
        lat: Math.random() * 180 - 90,
        lng: Math.random() * 360 - 180,
      }
    );
  };

  return (
    <Box
      bg="rgba(0, 0, 0, 0.5)"
      p={1}
      maxH="40px"
      maxW="900px"
      w="100%"
      overflow="hidden"
    >
      <HStack gap={1} align="center">
        {/* Address Input */}
        <HStack gap={1} flex={1}>
          <Input
            id="address-input"
            name="address"
            autoComplete="street-address"
            placeholder="Enter city or address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
            size="xs"
            variant="flushed"
            bg="transparent"
            color="white"
            _placeholder={{ color: "gray.400" }}
            flex={1}
          />
          <Button
            onClick={handleAddressSubmit}
            disabled={isLoading}
            size="sm"
            h="25px"
            colorScheme="blue"
            fontWeight="600"
            fontSize="0.7rem"
            borderRadius="md"
            whiteSpace="nowrap"
          >
            {isLoading ? "Searching..." : "Add Location"}
          </Button>
        </HStack>

        <Text color="gray.400" fontSize="0.8rem" whiteSpace="nowrap">
          OR
        </Text>

        {/* Coordinate Inputs */}
        <HStack gap={1} flex={1}>
          <Input
            id="latitude-input"
            name="latitude"
            autoComplete="off"
            type="number"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            step="any"
            min="-90"
            max="90"
            size="xs"
            variant="flushed"
            bg="transparent"
            w="80px"
            color="white"
            _placeholder={{ color: "gray.400" }}
          />
          <Input
            id="longitude-input"
            name="longitude"
            autoComplete="off"
            type="number"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            step="any"
            min="-180"
            max="180"
            size="xs"
            variant="flushed"
            bg="transparent"
            w="80px"
            color="white"
            _placeholder={{ color: "gray.400" }}
          />
          <Button
            onClick={handleCoordinateSubmit}
            size="sm"
            h="25px"
            colorScheme="blue"
            fontWeight="600"
            fontSize="0.7rem"
            borderRadius="md"
            whiteSpace="nowrap"
          >
            Add Coordinates
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default LocationInput;