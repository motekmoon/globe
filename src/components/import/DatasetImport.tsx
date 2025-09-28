import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertRoot,
  AlertTitle,
  ProgressRoot,
  ProgressRange,
  ProgressTrack,
  Badge,
  DialogRoot,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Code,
} from "@chakra-ui/react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { datasetImporter, DatasetImportResult } from "../../lib/datasetImport";
import {
  flexibleDatasetImporter,
  FlexibleImportResult,
} from "../../lib/flexibleDatasetImporter";
import DynamicVisualization from "../visualization/DynamicVisualization";

interface DatasetImportProps {
  onImport: (locations: any[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DatasetImport: React.FC<DatasetImportProps> = ({
  onImport,
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<DatasetImportResult | null>(
    null
  );
  const [flexibleResult, setFlexibleResult] =
    useState<FlexibleImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDynamicVisualization, setShowDynamicVisualization] =
    useState(false);
  const [rawData, setRawData] = useState<any[]>([]);
  const [useFlexibleImport, setUseFlexibleImport] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Note: useToast is not available in Chakra UI v3, using console.log for now
  const showToast = (
    title: string,
    description: string,
    status: "success" | "error" | "warning" | "info" = "info"
  ) => {
    console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setImportResult(null);
    setFlexibleResult(null);

    try {
      // Add a small delay to prevent UI blocking
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (useFlexibleImport) {
        // Use flexible importer that can handle any schema
        console.log(
          "Starting flexible import for file:",
          file.name,
          "Size:",
          file.size
        );
        const result = await flexibleDatasetImporter.importFromFile(file);
        console.log("Flexible import result:", result);
        setFlexibleResult(result);

        if (result.success) {
          showToast(
            "Import Successful",
            `${result.validRows} locations detected. Use Visualization Settings for advanced mapping.`,
            "success"
          );
        } else {
          showToast(
            "Import Issues",
            `Found ${result.errors.length} errors during import`,
            "warning"
          );
        }
      } else {
        // Use original rigid importer
        const result = await datasetImporter.importFromFile(file);
        setImportResult(result);

        if (result.success) {
          showToast(
            "Import Successful",
            `${result.imported.length} locations imported successfully`,
            "success"
          );
        } else {
          showToast(
            "Import Issues",
            `Found ${result.errors.length} errors during import`,
            "warning"
          );
        }
      }
    } catch (error) {
      console.error("Import process error:", error);
      showToast(
        "Import Failed",
        `Failed to import file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (flexibleResult && flexibleResult.parsedLocations.length > 0) {
      onImport(flexibleResult.parsedLocations);
      showToast(
        "Locations Added",
        `${flexibleResult.parsedLocations.length} locations added to the globe`,
        "success"
      );
      onClose();
    } else if (importResult && importResult.imported.length > 0) {
      onImport(importResult.imported);
      showToast(
        "Locations Added",
        `${importResult.imported.length} locations added to the globe`,
        "success"
      );
      onClose();
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setFlexibleResult(null);
    setRawData([]);
    setShowDynamicVisualization(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = (format: "csv" | "json") => {
    const template = useFlexibleImport
      ? format === "csv"
        ? flexibleDatasetImporter.generateFlexibleCSVTemplate()
        : flexibleDatasetImporter.generateFlexibleJSONTemplate()
      : format === "csv"
      ? datasetImporter.generateCSVTemplate()
      : datasetImporter.generateJSONTemplate();

    const blob = new Blob([template], {
      type: format === "csv" ? "text/csv" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <DialogRoot open={isOpen} onOpenChange={onClose}>
        <DialogBackdrop />
        <DialogContent maxH="90vh" display="flex" flexDirection="column">
          <DialogHeader
            flexShrink={0}
            p={4}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="lg" fontWeight="bold">
              Import Dataset
            </Text>
            <DialogCloseTrigger />
          </DialogHeader>

          <DialogBody flex="1" overflowY="auto" minH="0" p={4}>
            <VStack align="stretch" gap={4}>
              {/* File Upload Area */}
              <Box
                border="2px dashed"
                borderColor={dragActive ? "blue.400" : "gray.300"}
                borderRadius="md"
                p={4}
                textAlign="center"
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                minH="100px"
                maxH="120px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <CloudArrowUpIcon className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                <Text fontSize="sm" fontWeight="semibold" mb={1}>
                  Drop file here or click to browse
                </Text>
                <Text color="gray.600" fontSize="xs" mb={2}>
                  CSV and JSON files
                </Text>
                <Button
                  colorScheme="blue"
                  variant="outline"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Choose File
                </Button>
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />

              {/* Import Mode Toggle */}
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Import Mode:
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    colorScheme={useFlexibleImport ? "blue" : "gray"}
                    variant={useFlexibleImport ? "solid" : "outline"}
                    onClick={() => setUseFlexibleImport(true)}
                  >
                    🧠 Smart Import (Recommended)
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={!useFlexibleImport ? "blue" : "gray"}
                    variant={!useFlexibleImport ? "solid" : "outline"}
                    onClick={() => setUseFlexibleImport(false)}
                  >
                    📋 Template Import
                  </Button>
                </HStack>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  {useFlexibleImport
                    ? "Automatically detects any CSV/JSON structure with coordinates (max 1000 rows, 10MB)"
                    : "Requires specific template format (name, latitude, longitude, quantity)"}
                </Text>
              </Box>

              {/* Template Downloads */}
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Download Templates:
                </Text>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadTemplate("csv")}
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    CSV Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadTemplate("json")}
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    JSON Template
                  </Button>
                </HStack>
              </Box>

              {/* Loading State */}
              {isLoading && (
                <Box>
                  <Text mb={2}>Processing file...</Text>
                  <Text fontSize="xs" color="gray.600" mb={2}>
                    Large files may take a moment to process
                  </Text>
                  <ProgressRoot value={null} size="sm" colorScheme="blue">
                    <ProgressTrack />
                    <ProgressRange />
                  </ProgressRoot>
                </Box>
              )}

              {/* Flexible Import Results */}
              {flexibleResult && (
                <Box>
                  <Box height="1px" bg="gray.200" mb={4} />
                  <Text fontWeight="semibold" mb={3}>
                    Flexible Import Results:
                  </Text>

                  <VStack gap={3} align="stretch">
                    {/* Summary */}
                    <HStack justify="space-between">
                      <Text>Total Rows:</Text>
                      <Badge colorScheme="gray">
                        {flexibleResult.totalRows}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Valid Locations:</Text>
                      <Badge colorScheme="green">
                        {flexibleResult.validRows}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Invalid Rows:</Text>
                      <Badge colorScheme="red">
                        {flexibleResult.invalidRows}
                      </Badge>
                    </HStack>

                    {/* Column Analysis */}
                    <Box>
                      <Text fontWeight="semibold" mb={2}>
                        Detected Columns:
                      </Text>
                      <HStack gap={2} wrap="wrap">
                        {Object.entries(
                          flexibleResult.columnAnalysis.detectedTypes
                        ).map(([column, type]) => (
                          <Badge
                            key={column}
                            colorScheme={
                              type === "latitude"
                                ? "blue"
                                : type === "longitude"
                                ? "purple"
                                : type === "numeric"
                                ? "orange"
                                : type === "text"
                                ? "green"
                                : "gray"
                            }
                          >
                            {column}: {type}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>

                    {/* Success/Error Alerts */}
                    {flexibleResult.success &&
                      flexibleResult.parsedLocations.length > 0 && (
                        <AlertRoot status="success">
                          <AlertIndicator>
                            <CheckCircleIcon className="h-4 w-4" />
                          </AlertIndicator>
                          <AlertContent>
                            <AlertTitle>Import Successful!</AlertTitle>
                            <AlertDescription>
                              {flexibleResult.parsedLocations.length} locations
                              detected with flexible schema. Use Dynamic
                              Visualization for advanced mapping.
                            </AlertDescription>
                          </AlertContent>
                        </AlertRoot>
                      )}

                    {flexibleResult.errors.length > 0 && (
                      <AlertRoot status="warning">
                        <AlertIndicator>
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        </AlertIndicator>
                        <AlertContent>
                          <AlertTitle>Import Issues Found</AlertTitle>
                          <AlertDescription>
                            {flexibleResult.errors.length} errors detected.
                            Check details below.
                          </AlertDescription>
                        </AlertContent>
                      </AlertRoot>
                    )}

                    {/* Error Details */}
                    {flexibleResult.errors.length > 0 && (
                      <Box>
                        <Text fontWeight="semibold" mb={2}>
                          Errors:
                        </Text>
                        <VStack
                          gap={1}
                          align="stretch"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {flexibleResult.errors.map((error, index) => (
                            <Text key={index} fontSize="sm" color="red.500">
                              {error}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {/* Sample Data Preview */}
                    {flexibleResult.rawData.length > 0 && (
                      <Box>
                        <Text fontWeight="semibold" mb={2}>
                          Sample Data (first 3 rows):
                        </Text>
                        <Code
                          p={3}
                          borderRadius="md"
                          fontSize="sm"
                          maxH="150px"
                          overflowY="auto"
                        >
                          {JSON.stringify(
                            flexibleResult.rawData.slice(0, 3),
                            null,
                            2
                          )}
                        </Code>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Import Results */}
              {importResult && (
                <Box>
                  <Box height="1px" bg="gray.200" mb={4} />
                  <Text fontWeight="semibold" mb={3}>
                    Import Results:
                  </Text>

                  <VStack gap={3} align="stretch">
                    {/* Summary */}
                    <HStack justify="space-between">
                      <Text>Total Rows:</Text>
                      <Badge colorScheme="gray">{importResult.totalRows}</Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Valid Locations:</Text>
                      <Badge colorScheme="green">
                        {importResult.validRows}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text>Invalid Rows:</Text>
                      <Badge colorScheme="red">
                        {importResult.invalidRows}
                      </Badge>
                    </HStack>

                    {/* Success/Error Alerts */}
                    {importResult.success &&
                      importResult.imported.length > 0 && (
                        <AlertRoot status="success">
                          <AlertIndicator>
                            <CheckCircleIcon className="h-4 w-4" />
                          </AlertIndicator>
                          <AlertContent>
                            <AlertTitle>Import Successful!</AlertTitle>
                            <AlertDescription>
                              {importResult.imported.length} locations ready to
                              import
                            </AlertDescription>
                          </AlertContent>
                        </AlertRoot>
                      )}

                    {importResult.errors.length > 0 && (
                      <AlertRoot status="warning">
                        <AlertIndicator>
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        </AlertIndicator>
                        <AlertContent>
                          <AlertTitle>Import Issues Found</AlertTitle>
                          <AlertDescription>
                            {importResult.errors.length} errors detected. Check
                            details below.
                          </AlertDescription>
                        </AlertContent>
                      </AlertRoot>
                    )}

                    {/* Error Details */}
                    {importResult.errors.length > 0 && (
                      <Box>
                        <Text fontWeight="semibold" mb={2}>
                          Errors:
                        </Text>
                        <VStack
                          gap={1}
                          align="stretch"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {importResult.errors.map((error, index) => (
                            <Text key={index} fontSize="sm" color="red.500">
                              {error}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {/* Sample Data Preview */}
                    {importResult.imported.length > 0 && (
                      <Box>
                        <Text fontWeight="semibold" mb={2}>
                          Preview (first 3 locations):
                        </Text>
                        <Code
                          p={3}
                          borderRadius="md"
                          fontSize="sm"
                          maxH="150px"
                          overflowY="auto"
                        >
                          {JSON.stringify(
                            importResult.imported.slice(0, 3),
                            null,
                            2
                          )}
                        </Code>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter
            flexShrink={0}
            borderTop="1px solid"
            borderColor="gray.200"
            bg="gray.50"
            p={4}
          >
            <HStack gap={2} w="100%" justify="flex-end">
              {importResult && (
                <Button variant="outline" onClick={resetImport}>
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}

              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>

              {/* Flexible Import Buttons */}
              {flexibleResult && (
                <Button colorScheme="blue" onClick={handleImport}>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Import {flexibleResult.parsedLocations?.length || 0} Locations
                </Button>
              )}

              {flexibleResult && flexibleResult.rawData.length > 0 && (
                <Button
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => {
                    setRawData(flexibleResult.rawData);
                    setShowDynamicVisualization(true);
                  }}
                >
                  ⚙️ Visualization Settings
                </Button>
              )}

              {/* Original Import Buttons */}
              {importResult && (
                <Button colorScheme="blue" onClick={handleImport}>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Import {importResult.imported?.length || 0} Locations
                </Button>
              )}

              {importResult && importResult.imported.length > 0 && (
                <Button
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => {
                    setRawData(importResult.imported);
                    setShowDynamicVisualization(true);
                  }}
                >
                  ⚙️ Visualization Settings
                </Button>
              )}
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Dynamic Visualization Modal */}
      {showDynamicVisualization && (
        <DynamicVisualization
          data={rawData}
          onVisualizationUpdate={(markers) => {
            // Convert dynamic markers to locations and import
            const locations = markers.map((marker) => ({
              name: marker.label,
              latitude: marker.position[1], // Convert from 3D to lat
              longitude: marker.position[0], // Convert from 3D to lng
              quantity: marker.size,
              // Add any additional data
              ...marker.data,
            }));
            onImport(locations);
            setShowDynamicVisualization(false);
          }}
          onClose={() => setShowDynamicVisualization(false)}
        />
      )}
    </>
  );
};

export default DatasetImport;