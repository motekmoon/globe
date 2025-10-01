import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
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
    columnMapping,
    uiSettings,
    updateUISettings,
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

  // Quantity visualization toggle (now persistent)
  const showQuantityVisualization = uiSettings.showQuantityVisualization;
  const setShowQuantityVisualization = (value: boolean) => {
    updateUISettings({ showQuantityVisualization: value });
  };

  // Globe rendering state
  const [isGlobeReady, setIsGlobeReady] = React.useState(false);
  const [isDataVisualizationReady, setIsDataVisualizationReady] =
    React.useState(false);

  // Trigger data visualization animation after globe is ready
  React.useEffect(() => {
    if (isGlobeReady) {
      // Small delay to ensure globe is fully rendered
      const timer = setTimeout(() => {
        setIsDataVisualizationReady(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isGlobeReady]);

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
        // bg="linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)"
      >
        {/* Logo and title positioned in bottom left */}
        <Box
          position="absolute"
          bottom="20px"
          left="20px"
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
            fontSize="1.8rem"
            fontWeight="600"
            fontFamily="'Alumni Sans Pinstripe', cursive, sans-serif"
            margin="0"
            h="40px"
            lineHeight="40px"
          >
            O R B O
          </Heading>
        </Box>

        {/* Navigation Container */}
        <Box
          position="absolute"
          top="15px"
          left="15px"
          right="15px"
          zIndex={30}
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap="10px"
          minWidth="1200px"
          overflow="visible"
          bg="transparent"
          pointerEvents="none"
        >
          {/* Left side - LocationForm */}
          <Box
            flex="1"
            minWidth="0"
            maxWidth="calc(100vw - 200px)"
            pointerEvents="auto"
            bg="rgba(0, 0, 0, 0.1)"
            borderRadius="md"
            zIndex={31}
          >
            <LocationForm onLocationAdd={handleLocationAdd} />
          </Box>

          {/* Right side - Buttons */}
          {!isDrawerOpen && (
            <Box
              display="flex"
              gap="12px"
              alignItems="center"
              flexShrink={0}
              minWidth="fit-content"
              pointerEvents="auto"
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
                  bg: "rgba(255, 255, 255, 0.9)",
                }}
              >
                Data Manager
              </Button>

              <Button
                onClick={() =>
                  setShowQuantityVisualization(!showQuantityVisualization)
                }
                size="sm"
                h="25px"
                bg="rgba(255, 255, 255, 0.8)"
                color="black"
                fontWeight="600"
                fontSize="0.7rem"
                borderRadius="md"
                whiteSpace="nowrap"
                border="none"
                title="Show/Hide Visualization"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.9)",
                }}
              >
                {showQuantityVisualization ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
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
                Live Edit ({locations.length})
              </Button>
            </Box>
          )}
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
        <div
          className={`data-visualization ${
            isDataVisualizationReady ? "ready" : ""
          }`}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            className={`globe-container ${isGlobeReady ? "ready" : ""}`}
            style={{
              filter: "grayscale(100%)",
            }}
          >
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              onCreated={() => {
                // Globe is ready when Canvas is created
                setTimeout(() => setIsGlobeReady(true), 100);
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
                  columnMapping={columnMapping}
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
        </div>

        {/* Animation Control Button */}
        <AnimationControl isPlaying={isPlaying} onToggle={toggleAnimation} />

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
