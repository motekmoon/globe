import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
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
import DataImport from './DataImport';

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
  const { locations, loading, error, refreshData } = useDataManager();

  const [activeTab, setActiveTab] = useState("table");

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
                console.log('Tab change:', value);
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
                  value="import"
                  onClick={() => setActiveTab("import")}
                >
                  Import
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  onClick={() => setActiveTab("analytics")}
                >
                  Analytics
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

              <TabsContent value="import">
                <DataImport
                  isOpen={true}
                  onClose={() => {}}
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
