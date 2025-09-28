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
} from '@chakra-ui/react';
import {
  TableCellsIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Location } from '../../lib/supabase';
import { useDataManager } from '../../hooks/useDataManager';
import DataTable from './DataTable';
import DataImport from './DataImport';

interface DataManagerProps {
  onLocationSelect?: (location: Location) => void;
  onLocationEdit?: (location: Location) => void;
}

const DataManager: React.FC<DataManagerProps> = ({
  onLocationSelect,
  onLocationEdit,
}) => {
  const {
    locations,
    loading,
    error,
    refreshData,
  } = useDataManager();

  const [activeTab, setActiveTab] = useState('table');
  const [showImport, setShowImport] = useState(false);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleImportSuccess = () => {
    setShowImport(false);
    refreshData(); // Refresh the data table
  };

  const handleLocationEdit = (location: Location) => {
    onLocationEdit?.(location);
  };

  return (
    <Box>
      {/* Header */}
      <VStack align="stretch" gap={4} mb={6}>
        <HStack justify="space-between">
          <VStack align="start" gap={1}>
            <Text fontSize="2xl" fontWeight="bold">
              Data Management
            </Text>
            <Text fontSize="sm" color="gray.600">
              Manage all your location data with full CRUD operations
            </Text>
          </VStack>
          <HStack gap={2}>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => setShowImport(true)}
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Import Data
            </Button>
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
      </VStack>

      {/* Main Content */}
      <TabsRoot value={activeTab} onValueChange={(value: string) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="table">
            <TableCellsIcon className="h-4 w-4 mr-2" />
            Data Table
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="export">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
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
              Coming soon: Data insights, charts, and analytics for your location data.
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

      {/* Import Modal */}
      <DataImport
        isOpen={showImport}
        onClose={() => setShowImport(false)}
      />
    </Box>
  );
};

export default DataManager;
