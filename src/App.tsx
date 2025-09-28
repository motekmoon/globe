import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  ChakraProvider,
  Box,
  Button,
  Text,
  Heading,
  createSystem,
  defaultConfig,
} from "@chakra-ui/react";
import Globe from "./components/Globe";
import LocationInput from "./components/LocationInput";
import Drawer from "./components/layout/Drawer";
import { locationService, Location } from "./lib/supabase";

// Create a system for Chakra UI
const system = createSystem(defaultConfig);

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenLocations, setHiddenLocations] = useState<Set<string>>(
    new Set()
  );
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "distance">("date");

  // Filter and sort locations
  const filteredLocations = locations
    .filter((location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "distance":
          // For now, just sort by name as distance calculation would require user location
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

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
        prev.map((loc) =>
          loc.id === updatedLocation.id ? updatedLocation : loc
        )
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
          <Box width="30px" height="30px">
            <img
              src="/logo.PNG"
              alt="Globe"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "transparent",
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
        {!isDrawerOpen && (
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
        )}

        {/* Input controls */}
        <Box
          position="absolute"
          top="5px"
          left={isDrawerOpen ? "10px" : "50%"}
          transform={isDrawerOpen ? "none" : "translateX(-50%)"}
          zIndex={10}
          width={isDrawerOpen ? "calc(100vw - 320px)" : "auto"}
          maxWidth="900px"
          p={2}
          transition="all 0.3s ease-in-out"
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
            filter: "grayscale(100%)",
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
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          locations={locations}
          filteredLocations={filteredLocations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          editingLocation={editingLocation}
          onEditLocation={setEditingLocation}
          onSaveLocation={handleSaveLocation}
          onHideLocation={handleHideLocation}
          onDeleteLocation={handleDeleteLocation}
          hiddenLocations={hiddenLocations}
        />
      </Box>
    </ChakraProvider>
  );
}

export default App;
