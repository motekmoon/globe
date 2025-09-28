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
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
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
}

const DataManager: React.FC<DataManagerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  onLocationEdit,
}) => {
  const { locations, loading, error, refreshData, importLocations } =
    useDataManager();

  const [activeTab, setActiveTab] = useState("table");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleImportSuccess = () => {
    refreshData(); // Refresh the data table
  };

  const handleLocationEdit = (location: Location) => {
    onLocationEdit?.(location);
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

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogBackdrop />
      <DialogContent maxW="1200px" maxH="90vh" w="100%">
        <DialogHeader>
          <Text fontSize="xl" fontWeight="bold">
            Data Management
          </Text>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody overflowY="auto">
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
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default DataManager;
