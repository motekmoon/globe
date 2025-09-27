import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  ChakraProvider,
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  createSystem,
  defaultConfig,
} from "@chakra-ui/react";
import Globe from "./components/Globe";
import LocationInput from "./components/LocationInput";
import { locationService, Location } from "./lib/supabase";

// Create a system for Chakra UI
const system = createSystem(defaultConfig);

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenLocations, setHiddenLocations] = useState<Set<string>>(new Set());
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load locations from Supabase on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await locationService.getLocations();
        setLocations(data);
      } catch (error) {
        console.error("Error loading locations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const handleLocationAdd = async (location: {
    name: string;
    lat: number;
    lng: number;
  }) => {
    try {
      const newLocation = await locationService.addLocation({
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
      });

      if (newLocation) {
        setLocations((prev) => [newLocation, ...prev]);
      }
    } catch (error) {
      console.error("Error adding location:", error);
      // Fallback to local state if database fails
      const fallbackLocation = {
        id: Date.now().toString(),
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocations((prev) => [fallbackLocation, ...prev]);
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
  };

  const handleSaveLocation = async (updatedLocation: Location) => {
    try {
      // Update in database
      await locationService.updateLocation(updatedLocation.id, {
        name: updatedLocation.name,
        latitude: updatedLocation.latitude,
        longitude: updatedLocation.longitude,
      });
      
      // Update local state
      setLocations((prev) =>
        prev.map((loc) => (loc.id === updatedLocation.id ? updatedLocation : loc))
      );
      setEditingLocation(null);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleHideLocation = (locationId: string) => {
    setHiddenLocations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      // Delete from database
      await locationService.deleteLocation(locationId);
      
      // Update local state
      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
      
      // Remove from hidden locations if it was hidden
      setHiddenLocations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(locationId);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  return (
    <ChakraProvider value={system}>
      <Box
        position="relative"
        width="100vw"
        height="100vh"
        bg="linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)"
      >
            {/* Logo and title positioned in upper left */}
            <Box
              position="absolute"
              top="5px"
              left="5px"
              zIndex={10}
              display="flex"
              alignItems="center"
              gap="8px"
            >
              <Box
                width="30px"
                height="30px"
              >
                <img 
                  src="/logo.PNG" 
                  alt="Globe" 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain",
                    background: "transparent"
                  }} 
                />
              </Box>
              <Heading
                color="white"
                fontSize="1.2rem"
                fontWeight="400"
                fontFamily="'SUSE Mono', monospace"
                margin="0"
              >
                Globe
              </Heading>
            </Box>

            {/* Locations drawer button */}
            <Button
              position="absolute"
              top="5px"
              right="5px"
              zIndex={10}
              onClick={() => setIsDrawerOpen(true)}
              size="sm"
              colorScheme="blue"
            >
              Locations ({locations.length})
            </Button>

        {/* Input controls */}
        <Box
          position="absolute"
          top="40px"
          left="50%"
          transform="translateX(-50%)"
          zIndex={10}
          width="100%"
          maxWidth="900px"
          px={4}
        >
          <LocationInput onLocationAdd={handleLocationAdd} />
          {loading && (
            <Text color="white" textAlign="center" mt={2}>
              Loading locations...
            </Text>
          )}
        </Box>

        {/* 3D Canvas */}
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          width="100%" 
          height="100%"
          style={{
            filter: "grayscale(100%)"
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{
              background:
                "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)",
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={1.2} />
              <directionalLight position={[10, 10, 5]} intensity={2.0} />
              <pointLight position={[-10, -10, -5]} intensity={1.0} />

                  <Globe locations={locations} hiddenLocations={hiddenLocations} />

              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
            </Box>

            {/* Location Manager Drawer */}
            {isDrawerOpen && (
              <Box
                position="fixed"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="rgba(0, 0, 0, 0.5)"
                zIndex={1000}
                onClick={() => setIsDrawerOpen(false)}
              >
                <Box
                  position="absolute"
                  right="0"
                  top="0"
                  bottom="0"
                  width="400px"
                  bg="gray.800"
                  p={6}
                  overflow="auto"
                  onClick={(e) => e.stopPropagation()}
                  boxShadow="lg"
                >
                  <HStack justify="space-between" align="center" mb={4}>
                    <Heading size="md">Location Manager</Heading>
                    <Button
                      size="sm"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      ✕
                    </Button>
                  </HStack>
                  
                  <VStack gap={3} align="stretch">
                    {locations.map((location) => (
                      <Box
                        key={location.id}
                        p={3}
                        border="1px solid"
                        borderColor="gray.600"
                        borderRadius="md"
                        bg="gray.700"
                      >
                        <HStack justify="space-between" align="center">
                          <VStack align="start" gap={1} flex={1}>
                            <Text fontWeight="bold">
                              {editingLocation?.id === location.id ? (
                                <Input
                                  size="sm"
                                  value={editingLocation.name}
                                  onChange={(e) =>
                                    setEditingLocation({
                                      ...editingLocation,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                location.name
                              )}
                            </Text>
                            <Text fontSize="sm" color="gray.300">
                              Lat: {editingLocation?.id === location.id ? (
                                <Input
                                  size="sm"
                                  type="number"
                                  value={editingLocation.latitude}
                                  onChange={(e) =>
                                    setEditingLocation({
                                      ...editingLocation,
                                      latitude: parseFloat(e.target.value),
                                    })
                                  }
                                />
                              ) : (
                                location.latitude.toFixed(4)
                              )}
                            </Text>
                            <Text fontSize="sm" color="gray.300">
                              Lng: {editingLocation?.id === location.id ? (
                                <Input
                                  size="sm"
                                  type="number"
                                  value={editingLocation.longitude}
                                  onChange={(e) =>
                                    setEditingLocation({
                                      ...editingLocation,
                                      longitude: parseFloat(e.target.value),
                                    })
                                  }
                                />
                              ) : (
                                location.longitude.toFixed(4)
                              )}
                            </Text>
                          </VStack>
                          
                          <HStack gap={2}>
                            {editingLocation?.id === location.id ? (
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleSaveLocation(editingLocation)}
                              >
                                Save
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleEditLocation(location)}
                              >
                                Edit
                              </Button>
                            )}
                            <Button
                              size="sm"
                              colorScheme={hiddenLocations.has(location.id) ? "red" : "orange"}
                              onClick={() => handleHideLocation(location.id)}
                            >
                              {hiddenLocations.has(location.id) ? "Show" : "Hide"}
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleDeleteLocation(location.id)}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </Box>
            )}
          </Box>
        </ChakraProvider>
      );
    }

    export default App;
