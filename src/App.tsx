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
import DatasetImport from "./components/import/DatasetImport";
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

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  // Filter and sort locations using utility function
  const filteredLocations = filterAndSortLocations(
    locations,
    searchQuery,
    sortBy
  );

  // Handle bulk import
  const handleImportLocations = async (importedLocations: any[]) => {
    try {
      const result = await handleBulkImport(importedLocations);
      console.log(
        `Import completed: ${result.success} successful, ${result.failed} failed`
      );
    } catch (error) {
      console.error("Bulk import failed:", error);
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
          top="10px"
          left="10px"
          zIndex={10}
          display="flex"
          alignItems="center"
          gap="8px"
          h="25px"
          p="0"
        >
          <Box width="20px" height="20px">
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
            fontSize="0.7rem"
            fontWeight="600"
            fontFamily="'SUSE Mono', monospace"
            margin="0"
            h="25px"
            lineHeight="25px"
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
              onClick={() => setIsImportModalOpen(true)}
              size="sm"
              h="25px"
              colorScheme="green"
              variant="outline"
              fontWeight="600"
              fontSize="0.7rem"
              borderRadius="md"
              whiteSpace="nowrap"
            >
              Import
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
          maxWidth="900px"
          p="0"
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

              <Globe
                locations={locations}
                hiddenLocations={hiddenLocations}
                isPlaying={isPlaying}
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

        {/* Dataset Import Modal */}
        <DatasetImport
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportLocations}
        />
      </Box>
    </ChakraProvider>
  );
}

export default App;
