import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Divider,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Code,
  Link,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { datasetImporter, DatasetImportResult } from '../../lib/datasetImport';

interface DatasetImportProps {
  onImport: (locations: any[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DatasetImport: React.FC<DatasetImportProps> = ({ onImport, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<DatasetImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setImportResult(null);

    try {
      const result = await datasetImporter.importFromFile(file);
      setImportResult(result);

      if (result.success && result.imported.length > 0) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.imported.length} locations`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (result.errors.length > 0) {
        toast({
          title: "Import Issues",
          description: `${result.errors.length} errors found. Check details below.`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDownloadTemplate = (format: 'csv' | 'json') => {
    const template = format === 'csv' 
      ? datasetImporter.generateCSVTemplate()
      : datasetImporter.generateJSONTemplate();
    
    const blob = new Blob([template], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <CloudArrowUpIcon className="h-5 w-5" />
            <Text>Import Dataset</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* File Upload Area */}
            <Box
              border="2px dashed"
              borderColor={dragActive ? "blue.300" : "gray.300"}
              borderRadius="lg"
              p={8}
              textAlign="center"
              bg={dragActive ? "blue.50" : "gray.50"}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ borderColor: "blue.400", bg: "blue.50" }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <Text fontSize="lg" fontWeight="semibold" mb={2}>
                Drop your file here or click to browse
              </Text>
              <Text color="gray.600" mb={4}>
                Supports CSV and JSON files
              </Text>
              <Button
                colorScheme="blue"
                variant="outline"
                size="sm"
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
              style={{ display: 'none' }}
            />

            {/* Template Downloads */}
            <Box>
              <Text fontWeight="semibold" mb={3}>Download Templates:</Text>
              <HStack spacing={4}>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<DocumentTextIcon className="h-4 w-4" />}
                  onClick={() => handleDownloadTemplate('csv')}
                >
                  CSV Template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<DocumentTextIcon className="h-4 w-4" />}
                  onClick={() => handleDownloadTemplate('json')}
                >
                  JSON Template
                </Button>
              </HStack>
            </Box>

            {/* Loading State */}
            {isLoading && (
              <Box>
                <Text mb={2}>Processing file...</Text>
                <Progress size="sm" isIndeterminate colorScheme="blue" />
              </Box>
            )}

            {/* Import Results */}
            {importResult && (
              <Box>
                <Divider mb={4} />
                <Text fontWeight="semibold" mb={3}>Import Results:</Text>
                
                <VStack spacing={3} align="stretch">
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
                    <Alert status="success">
                      <CheckCircleIcon className="h-4 w-4" />
                      <Box>
                        <AlertTitle>Import Successful!</AlertTitle>
                        <AlertDescription>
                          {importResult.imported.length} locations ready to import
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {importResult.errors.length > 0 && (
                    <Alert status="warning">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <Box>
                        <AlertTitle>Import Issues Found</AlertTitle>
                        <AlertDescription>
                          {importResult.errors.length} errors detected. Check details below.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {/* Error Details */}
                  {importResult.errors.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Errors:</Text>
                      <VStack spacing={1} align="stretch" maxH="200px" overflowY="auto">
                        {importResult.errors.map((error, index) => (
                          <Text key={index} fontSize="sm" color="red.600" bg="red.50" p={2} borderRadius="md">
                            {error}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Sample Data Preview */}
                  {importResult.imported.length > 0 && (
                    <Box>
                      <Text fontWeight="semibold" mb={2}>Preview (first 3 locations):</Text>
                      <Code p={3} borderRadius="md" fontSize="sm" maxH="150px" overflowY="auto">
                        {JSON.stringify(importResult.imported.slice(0, 3), null, 2)}
                      </Code>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            {importResult && (
              <Button
                variant="outline"
                leftIcon={<XMarkIcon className="h-4 w-4" />}
                onClick={resetImport}
              >
                Reset
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {importResult && importResult.imported.length > 0 && (
              <Button
                colorScheme="blue"
                leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                onClick={handleImport}
              >
                Import {importResult.imported.length} Locations
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DatasetImport;
