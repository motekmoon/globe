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
} from '@chakra-ui/react';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { datasetImporter, DatasetImportResult } from '../../lib/datasetImport';
import {
  flexibleDatasetImporter,
  FlexibleImportResult,
} from '../../lib/flexibleDatasetImporter';
import { useDataManager } from '../../hooks/useDataManager';

interface DataImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataImport: React.FC<DataImportProps> = ({ isOpen, onClose }) => {
  const { importLocations } = useDataManager();
  
  const [importResult, setImportResult] = useState<DatasetImportResult | null>(null);
  const [flexibleResult, setFlexibleResult] = useState<FlexibleImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useFlexibleImport, setUseFlexibleImport] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (title: string, description: string, status: 'success' | 'error' | 'warning') => {
    console.log(`${status.toUpperCase()}: ${title} - ${description}`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
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
      if (useFlexibleImport) {
        const result = await flexibleDatasetImporter.importFromFile(file);
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

  const handleImport = async () => {
    if (flexibleResult && flexibleResult.parsedLocations.length > 0) {
      try {
        const result = await importLocations(flexibleResult.parsedLocations);
        showToast(
          "Locations Added",
          `${result.success} locations added to the globe`,
          "success"
        );
        onClose();
      } catch (error) {
        showToast(
          "Import Failed",
          "Failed to save locations to database",
          "error"
        );
      }
    } else if (importResult && importResult.imported.length > 0) {
      try {
        const result = await importLocations(importResult.imported);
        showToast(
          "Locations Added",
          `${result.success} locations added to the globe`,
          "success"
        );
        onClose();
      } catch (error) {
        showToast(
          "Import Failed",
          "Failed to save locations to database",
          "error"
        );
      }
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setFlexibleResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = (format: "csv" | "json") => {
    const template = useFlexibleImport
      ? (format === "csv"
          ? flexibleDatasetImporter.generateFlexibleCSVTemplate()
          : flexibleDatasetImporter.generateFlexibleJSONTemplate())
      : (format === "csv"
          ? datasetImporter.generateCSVTemplate()
          : datasetImporter.generateJSONTemplate());

    const blob = new Blob([template], {
      type: format === "csv" ? "text/csv" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `globe-template.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogBackdrop />
      <DialogContent maxH="90vh" display="flex" flexDirection="column">
        <DialogHeader flexShrink={0} p={4} borderBottom="1px solid" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="bold">
            Import Dataset
          </Text>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody flex="1" overflowY="auto" minH="0" p={4}>
          <VStack align="stretch" gap={4}>
            {/* Import Mode Selection */}
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

            {/* File Upload Area */}
            <Box
              border="2px dashed"
              borderColor={dragActive ? "blue.400" : "gray.300"}
              borderRadius="md"
              p={6}
              textAlign="center"
              bg={dragActive ? "blue.50" : "gray.50"}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <VStack gap={3}>
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                <Text fontSize="lg" fontWeight="semibold">
                  Drop your file here or click to browse
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Supports CSV and JSON files
                </Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                />
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  Choose File
                </Button>
              </VStack>
            </Box>

            {/* Template Downloads */}
            <Box>
              <Text fontWeight="semibold" mb={2}>
                Download Template:
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
                    <Text>Valid Rows:</Text>
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
                            detected with flexible schema. Use Visualization
                            Settings for advanced mapping.
                          </AlertDescription>
                        </AlertContent>
                      </AlertRoot>
                    )}

                  {flexibleResult.errors.length > 0 && (
                    <AlertRoot status="error">
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
                        Error Details:
                      </Text>
                      <VStack align="stretch" gap={1}>
                        {flexibleResult.errors.slice(0, 5).map((error, index) => (
                          <Text key={index} fontSize="sm" color="red.600">
                            • {error}
                          </Text>
                        ))}
                        {flexibleResult.errors.length > 5 && (
                          <Text fontSize="sm" color="gray.600">
                            ... and {flexibleResult.errors.length - 5} more errors
                          </Text>
                        )}
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

            {/* Original Import Results */}
            {importResult && (
              <Box>
                <Box height="1px" bg="gray.200" mb={4} />
                <Text fontWeight="semibold" mb={3}>
                  Import Results:
                </Text>

                <VStack gap={3} align="stretch">
                  <HStack justify="space-between">
                    <Text>Imported:</Text>
                    <Badge colorScheme="green">
                      {importResult.imported.length}
                    </Badge>
                  </HStack>

                  {importResult.errors.length > 0 && (
                    <HStack justify="space-between">
                      <Text>Errors:</Text>
                      <Badge colorScheme="red">
                        {importResult.errors.length}
                      </Badge>
                    </HStack>
                  )}

                  {importResult.errors.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>
                        Error Details:
                      </Text>
                      <VStack align="stretch" gap={1}>
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <Text key={index} fontSize="sm" color="red.600">
                            • {error}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </DialogBody>

        <DialogFooter flexShrink={0} borderTop="1px solid" borderColor="gray.200" bg="gray.50" p={4}>
          <HStack gap={2} w="100%" justify="flex-end">
            {importResult && (
              <Button variant="outline" onClick={resetImport}>
                <XMarkIcon className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}

            {flexibleResult && (
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

            {/* Original Import Buttons */}
            {importResult && (
              <Button colorScheme="blue" onClick={handleImport}>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Import {importResult.imported?.length || 0} Locations
              </Button>
            )}
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default DataImport;
