import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Tabs,
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
} from "@chakra-ui/react";
// Icons removed
import { Location } from '../../lib/supabase';
import { useDataManager } from '../../hooks/useDataManager';
import DataTable from './DataTable';
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
  } = useDataManager();

  const [activeTab, setActiveTab] = useState("table");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError(null);
      setImportSuccess(null);
    }
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
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        <Box
          position="relative"
          w="100%"
          h="100vh"
          bg="white"
          overflow="auto"
        >
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
            <Text fontSize="xl" fontWeight="bold">
              Data Management
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              ✕
            </Button>
          </HStack>
        </Box>

        {/* Body */}
        <Box p={4}>
          <VStack align="stretch" gap={4}>
            {/* Header */}
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <Text fontSize="lg" fontWeight="semibold">
                  Manage all your location data
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Full CRUD operations, import/export, and data analysis
                </Text>
              </VStack>
              <HStack gap={2}>
                <Badge colorScheme="blue" fontSize="sm">
                  {locations.length} locations
                </Badge>
              </HStack>
            </HStack>

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
                <TabsTrigger
                  value="import"
                  onClick={() => setActiveTab("import")}
                >
                  Import
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  onClick={() => setActiveTab("export")}
                >
                  Export
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

              <TabsContent value="import">
                <VStack align="stretch" gap={4} p={6}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Import Data
                  </Text>
                  <Text color="gray.600">
                    Upload a CSV or JSON file to import location data.
                  </Text>

                  {/* File Upload */}
                  <VStack align="stretch" gap={3}>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileSelect}
                      size="sm"
                    />

                    {/* File Preview */}
                    {importFile && (
                      <HStack
                        justify="space-between"
                        align="center"
                        p={3}
                        bg="gray.100"
                        borderRadius="md"
                      >
                        <Text fontSize="sm" fontWeight="medium">
                          {importFile.name} (
                          {Math.round(importFile.size / 1024)} KB)
                        </Text>
                        <Button size="xs" onClick={resetImport}>
                          Remove
                        </Button>
                      </HStack>
                    )}

                    {/* Import Button */}
                    <Button
                      colorScheme="blue"
                      onClick={handleImport}
                      disabled={!importFile || importLoading}
                      loading={importLoading}
                    >
                      {importLoading ? "Importing..." : "Import Data"}
                    </Button>
                  </VStack>

                  {/* Success Message */}
                  {importSuccess && (
                    <AlertRoot status="success">
                      <AlertIndicator />
                      <AlertContent>
                        <AlertTitle>Import Successful!</AlertTitle>
                        <AlertDescription>{importSuccess}</AlertDescription>
                      </AlertContent>
                    </AlertRoot>
                  )}

                  {/* Error Message */}
                  {importError && (
                    <AlertRoot status="error">
                      <AlertIndicator />
                      <AlertContent>
                        <AlertTitle>Import Failed</AlertTitle>
                        <AlertDescription>{importError}</AlertDescription>
                      </AlertContent>
                    </AlertRoot>
                  )}
                </VStack>
              </TabsContent>

              <TabsContent value="export">
                <Box p={6} textAlign="center">
                  <Text fontSize="lg" fontWeight="semibold" mb={2}>
                    Export Options
                  </Text>
                  <Text color="gray.600">
                    Export functionality is available in the Data Table tab.
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
              <Text fontSize="lg" fontWeight="semibold">Edit Location</Text>
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
            <HStack justify="flex-end" gap={2} p={4} borderTop="1px solid" borderColor="gray.200">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </HStack>
          </Box>
        )}
    </Box>
  );
};

export default DataManager;
