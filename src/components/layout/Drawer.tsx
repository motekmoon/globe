import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  HStack,
  VStack,
  Heading,
  Button,
  Input,
  Text,
  Icon,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
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
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if content overflows and show/hide indicator accordingly
  const checkOverflow = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const hasOverflow = container.scrollHeight > container.clientHeight;
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5;
    
    setShowScrollIndicator(hasOverflow && !isAtBottom && !isScrolling);
  };

  // Handle scroll events with debouncing
  const handleScroll = () => {
    setIsScrolling(true);
    setShowScrollIndicator(false);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set new timeout to check after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      checkOverflow();
    }, 150);
  };

  // Set up scroll listener and initial check
  useEffect(() => {
    if (!isOpen) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    checkOverflow(); // Initial check
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isOpen, filteredLocations.length]);

  // Check overflow when filtered locations change
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is updated
      setTimeout(checkOverflow, 100);
    }
  }, [filteredLocations.length, isOpen]);

  if (!isOpen) return null;

  return (
    <Box
      data-drawer="location-manager"
      position="fixed"
      right="0"
      top="70px"
      bottom="0"
      width="300px"
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      boxShadow="lg"
    >
      {/* Scrollable Content Container */}
      <Box
        p={4}
        overflow="auto"
        height="100%"
        ref={scrollContainerRef}
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

      {/* Sticky Smart Scroll Down Indicator */}
      {showScrollIndicator && (
        <Box
          position="absolute"
          bottom="10px"
          left="50%"
          transform="translateX(-50%)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
          pointerEvents="none"
          zIndex={1001}
          opacity={showScrollIndicator ? 1 : 0}
          transition="opacity 0.3s ease-in-out"
        >
          <Text
            fontSize="xs"
            color="rgba(255, 255, 255, 0.6)"
            fontWeight="500"
            textAlign="center"
          >
            Scroll down
          </Text>
          <Icon
            as={ChevronDownIcon}
            boxSize={4}
            color="rgba(255, 255, 255, 0.6)"
            animation="bounce 3s infinite"
            css={{
              "@keyframes bounce": {
                "0%, 20%, 50%, 80%, 100%": {
                  transform: "translateY(0)",
                },
                "40%": {
                  transform: "translateY(-4px)",
                },
                "60%": {
                  transform: "translateY(-2px)",
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Drawer;
