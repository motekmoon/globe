import React, { Suspense } from "react";
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
import Globe from "./components/globe/Globe";
import LocationForm from "./components/location/LocationForm";
import Drawer from "./components/layout/Drawer";
import AnimationControl from "./components/controls/AnimationControl";
import { useLocations } from "./hooks/useLocations";
import { useDrawer } from "./hooks/useDrawer";
import { useAnimation } from "./hooks/useAnimation";
import { filterAndSortLocations } from "./utils/locationUtils";

// Create a system for Chakra UI
const system = createSystem(defaultConfig);

function App() {
  // Use custom hooks for state management
  const {
    locations,
    loading,
    hiddenLocations,
    editingLocation,
    setEditingLocation,
    handleLocationAdd,
    handleEditLocation,
    handleSaveLocation,
    handleHideLocation,
    handleDeleteLocation,
  } = useLocations();

  const {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useDrawer();

  const {
    isPlaying,
    toggleAnimation,
  } = useAnimation();

  // Filter and sort locations using utility function
  const filteredLocations = filterAndSortLocations(locations, searchQuery, sortBy);

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
            onClick={openDrawer}
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
          <LocationForm onLocationAdd={handleLocationAdd} />
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

              <Globe locations={locations} hiddenLocations={hiddenLocations} isPlaying={isPlaying} />

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

        {/* Animation Control Button */}
        <AnimationControl 
          isPlaying={isPlaying}
          onToggle={toggleAnimation}
        />

        {/* Location Manager Drawer */}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          locations={locations}
          filteredLocations={filteredLocations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          editingLocation={editingLocation}
          onEditLocation={handleEditLocation}
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
