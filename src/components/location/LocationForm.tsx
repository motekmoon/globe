import React, { useState } from 'react';
import { Box, HStack, Input, Button, Text } from "@chakra-ui/react";
import { geocodeAddress, validateCoordinates } from "../../lib/geocoding";

interface LocationFormProps {
  onLocationAdd?: (location: {
    name: string;
    lat: number;
    lng: number;
    quantity?: number;
  }) => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ onLocationAdd }) => {
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsLoading(true);

    try {
      const result = await geocodeAddress(address);

      if (onLocationAdd) {
        onLocationAdd({
          ...result,
          quantity: quantity ? parseFloat(quantity) : undefined,
        });
      }
      setAddress("");
    } catch (error) {
      console.error("Address geocoding failed:", error);
      // The geocoding service handles fallback internally
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoordinateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const coords = validateCoordinates(lat, lng);

      if (coords) {
        if (onLocationAdd) {
          onLocationAdd({
            name: `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`,
            lat: coords.lat,
            lng: coords.lng,
            quantity: quantity ? parseFloat(quantity) : undefined,
          });
        }
        setLat("");
        setLng("");
      }
    } catch (error) {
      console.error("Coordinate validation failed:", error);
    }
  };

  return (
    <Box
      // bg="rgba(0, 0, 0, 0.5)"
      pt="0px"
      pb={4}
      px={4}
      maxH="70px"
      maxW="1400px"
      w="100%"
      overflow="hidden"
    >
      <HStack gap={3} align="center">
        {/* Address Input */}
        <HStack gap={3} flex={1}>
          <Input
            id="address-input"
            name="address"
            autoComplete="street-address"
            placeholder="Enter city or address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
            size="sm"
            h="25px"
            variant="flushed"
            bg="transparent"
            color="white"
            fontSize="0.7rem"
            _placeholder={{ color: "gray.400", fontSize: "0.7rem" }}
            flex={1}
          />
          <Input
            id="quantity-input"
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={isLoading}
            size="sm"
            h="25px"
            variant="flushed"
            bg="transparent"
            color="white"
            fontSize="0.7rem"
            _placeholder={{ color: "gray.400", fontSize: "0.7rem" }}
            step="any"
            min="0"
          />
          <Button
            onClick={handleAddressSubmit}
            disabled={isLoading}
            size="sm"
            h="25px"
            bg="rgba(255, 255, 255, 0.8)"
            color="black"
            fontWeight="600"
            fontSize="0.7rem"
            borderRadius="md"
            whiteSpace="nowrap"
            border="none"
            _hover={{
              bg: "rgba(255, 255, 255, 0.9)"
            }}
          >
            {isLoading ? "Searching..." : "Add Location"}
          </Button>
        </HStack>

        <Text color="gray.400" fontSize="0.8rem" whiteSpace="nowrap">
          OR
        </Text>

        {/* Coordinate Inputs */}
        <HStack gap={3} flex={1}>
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
            size="sm"
            h="25px"
            variant="flushed"
            bg="transparent"
            flex={1}
            color="white"
            fontSize="0.7rem"
            _placeholder={{ color: "gray.400", fontSize: "0.7rem" }}
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
            size="sm"
            h="25px"
            variant="flushed"
            bg="transparent"
            flex={1}
            color="white"
            fontSize="0.7rem"
            _placeholder={{ color: "gray.400", fontSize: "0.7rem" }}
          />
          <Input
            id="quantity-coord-input"
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            size="sm"
            h="25px"
            variant="flushed"
            bg="transparent"
            color="white"
            fontSize="0.7rem"
            _placeholder={{ color: "gray.400", fontSize: "0.7rem" }}
            step="any"
            min="0"
          />
          <Button
            onClick={handleCoordinateSubmit}
            size="sm"
            h="25px"
            bg="rgba(255, 255, 255, 0.8)"
            color="black"
            fontWeight="600"
            fontSize="0.7rem"
            borderRadius="md"
            whiteSpace="nowrap"
            border="none"
            _hover={{
              bg: "rgba(255, 255, 255, 0.9)"
            }}
          >
            Add Coordinates
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default LocationForm;
