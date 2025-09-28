import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  ChakraProvider,
  Box,
  Button,
  Text,
  Heading,
  Spinner,
  VStack,
  createSystem,
  defaultConfig,
} from "@chakra-ui/react";
import Globe from "./components/globe/Globe";
import LocationForm from "./components/location/LocationForm";
import Drawer from "./components/layout/Drawer";
import AnimationControl from "./components/controls/AnimationControl";
import DataManager from "./components/data/DataManager";
import { LocationProvider } from "./contexts/LocationContext";
import { useLocations } from "./hooks/useLocations";
import { useDrawer } from "./hooks/useDrawer";
import { useAnimation } from "./hooks/useAnimation";
import { filterAndSortLocations } from "./utils/locationUtils";
import { Location } from "./lib/supabase";

// Create a system for Chakra UI
const system = createSystem(defaultConfig);

function App() {
  // Use custom hooks for state management
  const {
    locations,
    loading,
    hiddenLocations,
    editingLocation,
    handleLocationAdd,
    handleEditLocation,
    handleSaveLocation,
    handleHideLocation,
    handleDeleteLocation,
    handleBulkImport,
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

  const { isPlaying, toggleAnimation } = useAnimation();

  // Data Management modal state
  const [isDataManagerOpen, setIsDataManagerOpen] = React.useState(false);

  // Globe pause state when data manager is open
  const [isGlobePaused, setIsGlobePaused] = React.useState(false);

  // Quantity visualization toggle
  const [showQuantityVisualization, setShowQuantityVisualization] =
    React.useState(false);

  // Filter and sort locations using utility function
  const filteredLocations = filterAndSortLocations(
    locations,
    searchQuery,
    sortBy
  );

  // Import functionality moved to Data Manager

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
          top="10px"
          left="10px"
          zIndex={10}
          display="flex"
          alignItems="center"
          gap="8px"
          h="45px"
          p="0"
        >
          <Box width="40px" height="40px">
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
            fontWeight="600"
            fontFamily="'SUSE Mono', monospace"
            margin="0"
            h="45px"
            lineHeight="45px"
          >
            Globe
          </Heading>
        </Box>

        {/* Top right buttons */}
        {!isDrawerOpen && (
          <Box
            position="absolute"
            top="10px"
            right="10px"
            zIndex={10}
            display="flex"
            gap="8px"
            h="25px"
            p="0"
            alignItems="center"
          >
            <Button
              onClick={() => setIsDataManagerOpen(true)}
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
              Data Manager
            </Button>
            <Button
              onClick={openDrawer}
              size="sm"
              h="25px"
              colorScheme="blue"
              fontWeight="600"
              fontSize="0.7rem"
              borderRadius="md"
              whiteSpace="nowrap"
            >
              Locations ({locations.length})
            </Button>
          </Box>
        )}

        {/* Input controls */}
        <Box
          position="absolute"
          top="10px"
          left={isDrawerOpen ? "10px" : "50%"}
          transform={isDrawerOpen ? "none" : "translateX(-50%)"}
          zIndex={10}
          width={isDrawerOpen ? "calc(100vw - 320px)" : "auto"}
          maxWidth="1400px"
          p="0"
          transition="all 0.3s ease-in-out"
        >
          <LocationForm onLocationAdd={handleLocationAdd} />
        </Box>

        {/* Loading Indicator */}
        {loading && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={20}
            bg="rgba(0, 0, 0, 0.8)"
            p={6}
            borderRadius="lg"
            boxShadow="xl"
          >
            <VStack gap={4} align="center">
              <Spinner size="xl" color="blue.400" />
              <Text color="white" fontSize="lg" fontWeight="semibold">
                Loading locations...
              </Text>
            </VStack>
          </Box>
        )}

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

              <Globe
                locations={locations}
                hiddenLocations={hiddenLocations}
                isPlaying={isPlaying && !isGlobePaused}
                showQuantityVisualization={showQuantityVisualization}
              />

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
        <AnimationControl isPlaying={isPlaying} onToggle={toggleAnimation} />

        {/* Quantity Visualization Toggle Button */}
        <Button
          position="absolute"
          bottom="20px"
          right="20px"
          size="sm"
          h="25px"
          bg="rgba(255, 255, 255, 0.8)"
          color="black"
          fontWeight="600"
          fontSize="0.7rem"
          borderRadius="md"
          whiteSpace="nowrap"
          border="none"
          onClick={() =>
            setShowQuantityVisualization(!showQuantityVisualization)
          }
          _hover={{
            bg: "rgba(255, 255, 255, 0.9)"
          }}
        >
          {showQuantityVisualization ? "Hide Qty" : "Show Qty"}
        </Button>

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

        {/* Data Management Modal */}
        <DataManager
          isOpen={isDataManagerOpen}
          onClose={() => setIsDataManagerOpen(false)}
          onGlobePause={setIsGlobePaused}
        />
      </Box>
    </ChakraProvider>
  );
}

// Main App component wrapped with LocationProvider
const AppWithProvider = () => {
  return (
    <LocationProvider>
      <App />
    </LocationProvider>
  );
};

export default AppWithProvider;
