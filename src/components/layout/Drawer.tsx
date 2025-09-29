import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Button,
  Input,
  Text,
} from "@chakra-ui/react";
import { Location } from "../../lib/supabase";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  filteredLocations: Location[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "name" | "date" | "distance";
  onSortChange: (sort: "name" | "date" | "distance") => void;
  editingLocation: Location | null;
  onEditLocation: (location: Location) => void;
  onSaveLocation: (location: Location) => Promise<void>;
  onHideLocation: (id: string) => void;
  onDeleteLocation: (id: string) => Promise<void>;
  hiddenLocations: Set<string>;
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  locations,
  filteredLocations,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  editingLocation,
  onEditLocation,
  onSaveLocation,
  onHideLocation,
  onDeleteLocation,
  hiddenLocations,
}) => {
  if (!isOpen) return null;

  return (
    <Box
      data-drawer="location-manager"
      position="fixed"
      right="0"
      top="0"
      bottom="0"
      width="300px"
      bg="rgba(0, 0, 0, 0.5)"
      p={4}
      overflow="auto"
      zIndex={1000}
      boxShadow="lg"
    >
      <HStack justify="space-between" align="center" mb={4}>
        <Heading size="md" color="white">
          Live Edit
        </Heading>
        <Button
          size="sm"
          h="25px"
          colorScheme="gray"
          onClick={onClose}
          fontSize="0.7rem"
        >
          ✕
        </Button>
      </HStack>

      {/* Search Input */}
      <Input
        placeholder="Search locations..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        variant="flushed"
        bg="transparent"
        color="white"
        _placeholder={{ color: "gray.400" }}
        mb={2}
        size="xs"
      />

      {/* Sort Dropdown */}
      <select
        value={sortBy}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          onSortChange(e.target.value as "name" | "date" | "distance")
        }
        className="sort-dropdown"
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
          color: "white",
          padding: "4px 0",
          fontSize: "0.7rem",
          marginBottom: "16px",
          outline: "none",
          fontFamily: "inherit",
          fontWeight: "400",
          borderRadius: "0",
          WebkitBorderRadius: "0",
          MozBorderRadius: "0",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
        onFocus={(e) => {
          e.target.style.borderBottomColor = "rgba(66, 153, 225, 0.8)";
        }}
        onBlur={(e) => {
          e.target.style.borderBottomColor = "rgba(255, 255, 255, 0.3)";
        }}
      >
        <option
          value="date"
          style={{ backgroundColor: "#1a1a1a", color: "white" }}
        >
          Sort by Date (Newest)
        </option>
        <option
          value="name"
          style={{ backgroundColor: "#1a1a1a", color: "white" }}
        >
          Sort by Name
        </option>
        <option
          value="distance"
          style={{ backgroundColor: "#1a1a1a", color: "white" }}
        >
          Sort by Distance
        </option>
      </select>

      <VStack gap={3} align="stretch">
        {filteredLocations.length === 0 ? (
          <Text color="gray.400" textAlign="center" py={4}>
            {searchQuery
              ? "No locations found matching your search."
              : "No locations added yet."}
          </Text>
        ) : (
          filteredLocations.map((location) => (
            <Box
              key={location.id}
              p={3}
              borderRadius="md"
              bg="rgba(0, 0, 0, 0.3)"
            >
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={1} flex={1}>
                  <Text fontWeight="bold" color="white" fontSize="0.7rem">
                    {editingLocation?.id === location.id ? (
                      <Input
                        size="xs"
                        variant="flushed"
                        value={editingLocation.name}
                        onChange={(e) =>
                          onEditLocation({
                            ...editingLocation,
                            name: e.target.value,
                          })
                        }
                        bg="transparent"
                        color="white"
                        _placeholder={{ color: "gray.400" }}
                      />
                    ) : (
                      location.name
                    )}
                  </Text>
                  <Text fontSize="xs" color="gray.300">
                    Lat:{" "}
                    {editingLocation?.id === location.id ? (
                      <Input
                        size="xs"
                        variant="flushed"
                        type="number"
                        value={editingLocation.latitude || ""}
                        onChange={(e) =>
                          onEditLocation({
                            ...editingLocation,
                            latitude: parseFloat(e.target.value),
                          })
                        }
                        bg="transparent"
                        color="white"
                        _placeholder={{ color: "gray.400" }}
                        w="80px"
                      />
                    ) : location.latitude !== undefined &&
                      location.latitude !== null ? (
                      typeof location.latitude === "number" ? (
                        location.latitude.toFixed(4)
                      ) : (
                        parseFloat(location.latitude).toFixed(4)
                      )
                    ) : (
                      "N/A"
                    )}
                  </Text>
                  <Text fontSize="xs" color="gray.300">
                    Lng:{" "}
                    {editingLocation?.id === location.id ? (
                      <Input
                        size="xs"
                        variant="flushed"
                        type="number"
                        value={editingLocation.longitude || ""}
                        onChange={(e) =>
                          onEditLocation({
                            ...editingLocation,
                            longitude: parseFloat(e.target.value),
                          })
                        }
                        bg="transparent"
                        color="white"
                        _placeholder={{ color: "gray.400" }}
                        w="80px"
                      />
                    ) : location.longitude !== undefined &&
                      location.longitude !== null ? (
                      typeof location.longitude === "number" ? (
                        location.longitude.toFixed(4)
                      ) : (
                        parseFloat(location.longitude).toFixed(4)
                      )
                    ) : (
                      "N/A"
                    )}
                  </Text>
                  <Text fontSize="xs" color="gray.300">
                    Qty:{" "}
                    {editingLocation?.id === location.id ? (
                      <Input
                        size="xs"
                        variant="flushed"
                        type="text"
                        value={editingLocation.quantity || ""}
                        onChange={(e) =>
                          onEditLocation({
                            ...editingLocation,
                            quantity: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                        bg="transparent"
                        color="white"
                        _placeholder={{ color: "gray.400" }}
                        w="60px"
                        placeholder="1"
                      />
                    ) : (
                      location.quantity || "1"
                    )}
                  </Text>
                </VStack>

                <VStack gap={1}>
                  {editingLocation?.id === location.id ? (
                    <Button
                      size="sm"
                      h="25px"
                      colorScheme="green"
                      onClick={() => onSaveLocation(editingLocation)}
                      fontWeight="600"
                      fontSize="0.7rem"
                      borderRadius="md"
                      whiteSpace="nowrap"
                      w="100%"
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      h="25px"
                      colorScheme="blue"
                      onClick={() => onEditLocation(location)}
                      fontWeight="600"
                      fontSize="0.7rem"
                      borderRadius="md"
                      whiteSpace="nowrap"
                      w="100%"
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    size="sm"
                    h="25px"
                    colorScheme={
                      hiddenLocations.has(location.id) ? "red" : "orange"
                    }
                    onClick={() => onHideLocation(location.id)}
                    fontWeight="600"
                    fontSize="0.7rem"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    w="100%"
                  >
                    {hiddenLocations.has(location.id) ? "Show" : "Hide"}
                  </Button>
                  <Button
                    size="sm"
                    h="25px"
                    colorScheme="red"
                    onClick={() => onDeleteLocation(location.id)}
                    fontWeight="600"
                    fontSize="0.7rem"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    w="100%"
                  >
                    Delete
                  </Button>
                </VStack>
              </HStack>
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default Drawer;
