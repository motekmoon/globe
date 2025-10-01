import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/solid";
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
import DataManager from "./components/data/DataManager";
import { LocationProvider } from "./contexts/LocationContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useLocations } from "./hooks/useLocations";
import { useAuth } from "./contexts/AuthContext";
import { useDrawer } from "./hooks/useDrawer";
import { useAnimation } from "./hooks/useAnimation";
import { filterAndSortLocations } from "./utils/locationUtils";
import { Location } from "./lib/supabase";
import AuthModal from "./components/auth/AuthModal";
import UserProfile from "./components/auth/UserProfile";

// Create a system for Chakra UI
const system = createSystem(defaultConfig);

function App() {
  // Authentication state
  const { user, isAuthenticated, loading: authLoading } = useAuth();

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

  // Authentication modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

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
        {/* Bottom Controls - Flex Container */}
        <Box
          position="absolute"
          bottom="20px"
          left="20px"
          zIndex={10}
          display="flex"
          alignItems="center"
          gap="8px"
        >
          {/* Logo */}
          <Box
            width="40px"
            height="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
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

          {/* ORBO Text */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minWidth="fit-content"
          >
            <Heading
              color="white"
              fontSize="1.8rem"
              fontWeight="600"
              fontFamily="'Alumni Sans Pinstripe', cursive, sans-serif"
              m={0}
            >
              O R B O
            </Heading>
          </Box>

          {/* Play/Pause Button */}
          <Button
            onClick={toggleAnimation}
            size="md"
            width="40px"
            height="40px"
            bg="rgba(255, 255, 255, 0.1)"
            color="white"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            aria-label={
              isPlaying ? "Pause globe animation" : "Play globe animation"
            }
            _hover={{
              bg: "rgba(255, 255, 255, 0.2)",
              transform: "scale(1.05)",
              transition: "all 0.2s ease-in-out",
            }}
            _active={{
              bg: "rgba(255, 255, 255, 0.3)",
              transform: "scale(0.95)",
            }}
          >
            {isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </Button>

          {/* Show/Hide Visualization Button */}
          <Button
            onClick={() =>
              setShowQuantityVisualization(!showQuantityVisualization)
            }
            size="md"
            width="40px"
            height="40px"
            bg="rgba(255, 255, 255, 0.1)"
            color="white"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            title="Show/Hide Visualization"
            aria-label={
              showQuantityVisualization
                ? "Hide visualization"
                : "Show visualization"
            }
            _hover={{
              bg: "rgba(255, 255, 255, 0.2)",
              transform: "scale(1.05)",
              transition: "all 0.2s ease-in-out",
            }}
            _active={{
              bg: "rgba(255, 255, 255, 0.3)",
              transform: "scale(0.95)",
            }}
          >
            {showQuantityVisualization ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </Button>
        </Box>

        {/* Navigation Container - Clean Flexible Layout */}
        <Box
          position="absolute"
          top="15px"
          left="15px"
          right="15px"
          zIndex={30}
          pointerEvents="none"
        >
          {/* Mobile Layout - Stacked */}
          <Box
            display={{ base: "flex", md: "none" }}
            flexDirection="column"
            gap="8px"
            width="100%"
          >
            {/* Row 1: Login + Buttons */}
            <Box display="flex" gap="8px" alignItems="center" flexWrap="wrap">
              {/* Login/User Profile */}
              <Box flexShrink={0} pointerEvents="auto" zIndex={31}>
                {isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    size="sm"
                    h="32px"
                    colorScheme="green"
                    fontWeight="600"
                    fontSize="0.7rem"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    title="Sign in to save your projects"
                  >
                    Sign In
                  </Button>
                )}
              </Box>

              {/* Data Manager - Mobile */}
              {!isDrawerOpen && (
                <Box flexShrink={0} pointerEvents="auto" zIndex={31}>
                  <Button
                    onClick={() => setIsDataManagerOpen(true)}
                    size="sm"
                    h="32px"
                    bg="rgba(255, 255, 255, 0.8)"
                    color="black"
                    fontWeight="600"
                    fontSize="0.6rem"
                    borderRadius="md"
                    whiteSpace="nowrap"
                    border="none"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    Data Manager
                  </Button>
                </Box>
              )}

              {/* Quick Edit - Mobile */}
              {!isDrawerOpen && (
                <Box flexShrink={0} pointerEvents="auto" zIndex={31}>
                  <Button
                    onClick={openDrawer}
                    size="sm"
                    h="32px"
                    colorScheme="blue"
                    fontWeight="600"
                    fontSize="0.6rem"
                    borderRadius="md"
                    whiteSpace="nowrap"
                  >
                    Quick Edit ({locations.length})
                  </Button>
                </Box>
              )}
            </Box>

            {/* Row 2: Location Form - Full Width Flexible */}
            <Box
              width="100%"
              pointerEvents="auto"
              bg="rgba(0, 0, 0, 0.1)"
              borderRadius="md"
              zIndex={31}
              overflow="hidden"
              minWidth="0"
            >
              <LocationForm onLocationAdd={handleLocationAdd} />
            </Box>
          </Box>

          {/* Desktop Layout - Horizontal with Flexible LocationForm */}
          <Box
            display={{ base: "none", md: "flex" }}
            alignItems="center"
            gap="12px"
            width="100%"
            minWidth="0"
          >
            {/* Login/User Profile - Fixed */}
            <Box flexShrink={0} pointerEvents="auto" zIndex={31}>
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="sm"
                  h="32px"
                  colorScheme="green"
                  fontWeight="600"
                  fontSize="0.7rem"
                  borderRadius="md"
                  whiteSpace="nowrap"
                  title="Sign in to save your projects"
                >
                  Sign In
                </Button>
              )}
            </Box>

            {/* Location Form - Flexible Width */}
            <Box
              flex="1"
              minWidth="0"
              pointerEvents="auto"
              bg="rgba(0, 0, 0, 0.1)"
              borderRadius="md"
              zIndex={31}
              overflow="hidden"
            >
              <LocationForm onLocationAdd={handleLocationAdd} />
            </Box>

            {/* Data Manager - Fixed */}
            {/* {!isDrawerOpen && ( */}
            <Box flexShrink={0} pointerEvents="auto" zIndex={31}>
              <Button
                onClick={() => setIsDataManagerOpen(true)}
                size="sm"
                h="25px"
                py={0}
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
            </Box>
            {/* )} */}

            {/* Quick Edit - Fixed */}
            {/* {!isDrawerOpen && ( */}
            <Box flexShrink={0} pointerEvents="auto" zIndex={31}>
              <Button
                onClick={openDrawer}
                size="sm"
                h="25px"
                px={3}
                py={0}
                bg="rgba(255, 255, 255, 0.1)"
                color="white"
                fontWeight="600"
                fontSize="0.7rem"
                borderRadius="md"
                whiteSpace="nowrap"
                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
              >
                Live Edit ({locations.length})
              </Button>
            </Box>
            {/* )} */}
          </Box>
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

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </Box>
    </ChakraProvider>
  );
}

// Main App component wrapped with providers
const AppWithProvider = () => {
  return (
    <AuthProvider>
      <LocationProvider>
        <App />
      </LocationProvider>
    </AuthProvider>
  );
};

export default AppWithProvider;
