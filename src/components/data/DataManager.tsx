import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Badge,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
  FileUpload,
} from "@chakra-ui/react";
// Icons removed
import { Location } from "../../lib/supabase";
import { useDataManager } from "../../hooks/useDataManager";
import DataTable from "./DataTable";
import { flexibleDatasetImporter } from "../../lib/flexibleDatasetImporter";

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect?: (location: Location) => void;
  onLocationEdit?: (location: Location) => void;
  onGlobePause?: (paused: boolean) => void;
}

const DataManager: React.FC<DataManagerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  onLocationEdit,
  onGlobePause,
}) => {
  const {
    locations,
    loading,
    error,
    refreshData,
    importLocations,
    updateLocation,
    exportLocations,
    exportCompleteBackup,
    importBackupData,
  } = useDataManager();

  const [activeTab, setActiveTab] = useState("table");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Project file handling
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Pause globe rotation when data manager is open
  useEffect(() => {
    if (onGlobePause) {
      onGlobePause(isOpen);
    }
  }, [isOpen, onGlobePause]);

  const handleImportSuccess = () => {
    refreshData(); // Refresh the data table
  };

  const handleLocationEdit = (location: Location) => {
    setEditingLocation(location);
  };

  const handleSaveEdit = async () => {
    if (!editingLocation) return;

    try {
      await updateLocation(editingLocation.id, editingLocation);
      setEditingLocation(null);
      refreshData();
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingLocation(null);
  };

  const handleExport = (format: "csv" | "json") => {
    exportLocations(format);
  };

  // Project handlers
  const handleSaveProject = () => {
    try {
      exportCompleteBackup();
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const handleLoadProject = async () => {
    if (!projectFile) return;

    setProjectLoading(true);
    setProjectError(null);

    try {
      await importBackupData(projectFile);
      setProjectFile(null); // Clear the file after successful import
    } catch (error) {
      console.error("Failed to load project:", error);
      setProjectError(
        error instanceof Error ? error.message : "Failed to load project"
      );
    } finally {
      setProjectLoading(false);
    }
  };

  const resetProject = () => {
    setProjectFile(null);
    setProjectError(null);
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImportLoading(true);
    setImportError(null);
    setImportSuccess(null);

    try {
      const result = await flexibleDatasetImporter.importFromFile(importFile);

      if (result.success && result.parsedLocations.length > 0) {
        console.log(
          "🔄 Starting import of",
          result.parsedLocations.length,
          "locations"
        );

        // Import the locations using the data manager
        const importResult = await importLocations(result.parsedLocations);
        console.log("✅ Import result:", importResult);

        setImportSuccess(
          `Successfully imported ${importResult.success} locations`
        );
        setImportFile(null);

        // Add a small delay to ensure database is updated, then refresh
        console.log("🔄 Refreshing data...");
        setTimeout(async () => {
          await refreshData();
          console.log("✅ Data refresh completed");
        }, 100);
      } else {
        setImportError(
          "No valid locations found in the file. Try using the Dynamic Visualization feature for advanced data mapping."
        );
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportError(null);
    setImportSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <Box>
      {/* Main Data Manager Modal */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(0, 0, 0, 0.9)"
        zIndex={2000}
        overflow="auto"
      >
        <Box position="relative" w="100%" h="100vh" bg="white" overflow="auto">
          {/* Header */}
          <Box
            position="sticky"
            top="0"
            bg="white"
            borderBottom="1px solid"
            borderColor="gray.200"
            p={4}
            zIndex={10}
          >
            <HStack justify="space-between" align="center">
              <HStack gap={3} align="center">
                <Text fontSize="xl" fontWeight="bold">
                  Data Management
                </Text>
                <Badge colorScheme="blue" fontSize="sm">
                  {locations.length} locations
                </Badge>
              </HStack>
              <HStack gap={2} align="center">
                {/* Save/Load Project Section */}
                <HStack gap={2} align="center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveProject}
                    disabled={loading}
                  >
                    Save Project
                  </Button>

                  {!projectFile && (
                    <FileUpload.Root
                      accept={[".json"]}
                      maxFiles={1}
                      onFileChange={(details: any) => {
                        if (details.acceptedFiles.length > 0) {
                          setProjectFile(details.acceptedFiles[0]);
                          setProjectError(null);
                        }
                      }}
                    >
                      <FileUpload.HiddenInput />
                      <FileUpload.Trigger asChild>
                        <Button variant="outline" size="sm">
                          Load Project
                        </Button>
                      </FileUpload.Trigger>
                    </FileUpload.Root>
                  )}

                  {projectFile && (
                    <HStack gap={1} align="center">
                      <Text fontSize="xs" color="gray.600">
                        {projectFile.name}
                      </Text>
                      <Button size="xs" variant="ghost" onClick={resetProject}>
                        ✕
                      </Button>
                    </HStack>
                  )}

                  {projectFile && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={handleLoadProject}
                      disabled={projectLoading}
                      loading={projectLoading}
                    >
                      {projectLoading ? "Loading..." : "Load"}
                    </Button>
                  )}
                </HStack>

                {/* Import Section */}
                <HStack gap={2} align="center">
                  {!importFile && (
                    <FileUpload.Root
                      accept={[".csv", ".json"]}
                      maxFiles={1}
                      onFileChange={(details: any) => {
                        if (details.acceptedFiles.length > 0) {
                          setImportFile(details.acceptedFiles[0]);
                          setImportError(null);
                          setImportSuccess(null);
                        }
                      }}
                    >
                      <FileUpload.HiddenInput />
                      <FileUpload.Trigger asChild>
                        <Button variant="outline" size="sm">
                          Import Data
                        </Button>
                      </FileUpload.Trigger>
                    </FileUpload.Root>
                  )}

                  {importFile && (
                    <HStack gap={1} align="center">
                      <Text fontSize="xs" color="gray.600">
                        {importFile.name}
                      </Text>
                      <Button size="xs" variant="ghost" onClick={resetImport}>
                        ✕
                      </Button>
                    </HStack>
                  )}

                  {importFile && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={handleImport}
                      disabled={importLoading}
                      loading={importLoading}
                    >
                      {importLoading ? "Importing..." : "Import"}
                    </Button>
                  )}
                </HStack>

                {/* Export Section */}
                <HStack gap={2} align="center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("csv")}
                    disabled={loading}
                  >
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("json")}
                    disabled={loading}
                  >
                    Export JSON
                  </Button>
                </HStack>

                <Button size="sm" variant="ghost" onClick={onClose}>
                  ✕
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Body */}
          <Box p={4}>
            <VStack align="stretch" gap={4}>
              {/* Error Display */}
              {error && (
                <AlertRoot status="error">
                  <AlertIndicator />
                  <AlertContent>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </AlertContent>
                </AlertRoot>
              )}

              {/* Import Success Message */}
              {importSuccess && (
                <AlertRoot status="success">
                  <AlertIndicator />
                  <AlertContent>
                    <AlertTitle>Import Successful!</AlertTitle>
                    <AlertDescription>{importSuccess}</AlertDescription>
                  </AlertContent>
                </AlertRoot>
              )}

              {/* Import Error Message */}
              {importError && (
                <AlertRoot status="error">
                  <AlertIndicator />
                  <AlertContent>
                    <AlertTitle>Import Failed</AlertTitle>
                    <AlertDescription>{importError}</AlertDescription>
                  </AlertContent>
                </AlertRoot>
              )}

              {/* Project Error Message */}
              {projectError && (
                <AlertRoot status="error">
                  <AlertIndicator />
                  <AlertContent>
                    <AlertTitle>Load Project Failed</AlertTitle>
                    <AlertDescription>{projectError}</AlertDescription>
                  </AlertContent>
                </AlertRoot>
              )}

              {/* Main Content */}
              <TabsRoot
                value={activeTab}
                onValueChange={(value: string) => {
                  console.log("Tab change:", value);
                  setActiveTab(value);
                }}
              >
                <TabsList>
                  <TabsTrigger
                    value="table"
                    onClick={() => setActiveTab("table")}
                  >
                    Data Table
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    onClick={() => setActiveTab("analytics")}
                  >
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="table">
                  <DataTable
                    onLocationSelect={onLocationSelect}
                    onLocationEdit={handleLocationEdit}
                  />
                </TabsContent>

                <TabsContent value="analytics">
                  <Box p={6} textAlign="center">
                    <Text fontSize="lg" fontWeight="semibold" mb={2}>
                      Analytics Dashboard
                    </Text>
                    <Text color="gray.600">
                      Coming soon: Data insights, charts, and analytics for your
                      location data.
                    </Text>
                  </Box>
                </TabsContent>
              </TabsRoot>
            </VStack>
          </Box>
        </Box>
      </Box>

      {/* Edit Location Modal */}
      {editingLocation && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.8)"
          zIndex={3000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            maxW="500px"
            w="100%"
          >
            <Box p={4} borderBottom="1px solid" borderColor="gray.200">
              <Text fontSize="lg" fontWeight="semibold">
                Edit Location
              </Text>
            </Box>
            <Box p={4}>
              <VStack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Name
                  </Text>
                  <Input
                    value={editingLocation.name}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        name: e.target.value,
                      })
                    }
                    placeholder="Location name"
                  />
                </Box>
                <HStack gap={4} w="100%">
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Latitude
                    </Text>
                    <Input
                      type="number"
                      value={editingLocation.latitude}
                      onChange={(e) =>
                        setEditingLocation({
                          ...editingLocation,
                          latitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Latitude"
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Longitude
                    </Text>
                    <Input
                      type="number"
                      value={editingLocation.longitude}
                      onChange={(e) =>
                        setEditingLocation({
                          ...editingLocation,
                          longitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Longitude"
                    />
                  </Box>
                </HStack>
                <Box w="100%">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Quantity (Optional)
                  </Text>
                  <Input
                    type="number"
                    value={editingLocation.quantity || ""}
                    onChange={(e) =>
                      setEditingLocation({
                        ...editingLocation,
                        quantity: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Quantity"
                  />
                </Box>
              </VStack>
            </Box>
            <HStack
              justify="flex-end"
              gap={2}
              p={4}
              borderTop="1px solid"
              borderColor="gray.200"
            >
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default DataManager;
