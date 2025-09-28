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
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Note: useToast is not available in Chakra UI v3, using console.log for now
  const showToast = (
    title: string,
    description: string,
    status: "success" | "warning" | "error"
  ) => {
    console.log(`${status.toUpperCase()}: ${title} - ${description}`);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setImportResult(null);

    try {
      const result = await datasetImporter.importFromFile(file);
      setImportResult(result);

      if (result.success && result.imported.length > 0) {
        showToast(
          "Import Successful",
          `Imported ${result.imported.length} locations`,
          "success"
        );
      } else if (result.errors.length > 0) {
        showToast(
          "Import Issues",
          `${result.errors.length} errors found. Check details below.`,
          "warning"
        );
      }
    } catch (error) {
      showToast(
        "Import Failed",
        error instanceof Error ? error.message : "Unknown error occurred",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleImport = () => {
    if (importResult && importResult.imported.length > 0) {
      onImport(importResult.imported);
      onClose();
      setImportResult(null);
    }
  };

  const handleDownloadTemplate = (format: "csv" | "json") => {
    const template =
      format === "csv"
        ? datasetImporter.generateCSVTemplate()
        : datasetImporter.generateJSONTemplate();

    const blob = new Blob([template], {
      type: format === "csv" ? "text/csv" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `globe-locations-template.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e: any) => !e.open && onClose()}>
      <DialogBackdrop position="fixed" top="0" left="0" right="0" bottom="0" />
      <DialogContent
        maxW="500px"
        w="500px"
        minH="300px"
        maxH="80vh"
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={1000}
        margin="0"
        overflowY="auto"
      >
        <DialogHeader>
          <HStack>
            <CloudArrowUpIcon className="h-5 w-5" />
            <Text>Import Dataset</Text>
          </HStack>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack gap={3} align="stretch">
            {/* File Upload Area */}
            <Box
              border="2px dashed"
              borderColor={dragActive ? "blue.300" : "gray.300"}
              borderRadius="md"
              p={3}
              textAlign="center"
              bg={dragActive ? "blue.50" : "gray.50"}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ borderColor: "blue.400", bg: "blue.50" }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
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
                <ProgressRoot value={null} size="sm" colorScheme="blue">
                  <ProgressTrack />
                  <ProgressRange />
                </ProgressRoot>
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
                    <Badge colorScheme="green">{importResult.validRows}</Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text>Invalid Rows:</Text>
                    <Badge colorScheme="red">{importResult.invalidRows}</Badge>
                  </HStack>

                  {/* Success/Error Alerts */}
                  {importResult.success && importResult.imported.length > 0 && (
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
                          <Text
                            key={index}
                            fontSize="sm"
                            color="red.600"
                            bg="red.50"
                            p={2}
                            borderRadius="md"
                          >
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

        <DialogFooter>
          <HStack gap={2}>
            {importResult && (
              <Button variant="outline" onClick={resetImport}>
                <XMarkIcon className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}

            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

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

export default DatasetImport;
