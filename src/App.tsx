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

  return (
    <ChakraProvider value={system}>
      <Box
        position="relative"
        width="100vw"
        height="100vh"
        bg="linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)"
      >
        {/* Title positioned in upper left */}
        <Heading
          position="absolute"
          top="5px"
          left="5px"
          color="white"
          fontSize="1.2rem"
          fontWeight="300"
          zIndex={10}
        >
          Globe
        </Heading>

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
        <Box position="absolute" top={0} left={0} width="100%" height="100%">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{
              background:
                "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)",
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />

              <Globe locations={locations} />

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
      </Box>
    </ChakraProvider>
  );
}

export default App;
