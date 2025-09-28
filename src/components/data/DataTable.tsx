import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableColumnHeader,
  TableCell,
  CheckboxRoot,
  Badge,
  IconButton,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
  TooltipRoot,
} from '@chakra-ui/react';
import {
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { Location } from '../../lib/supabase';
import { useDataManager } from '../../hooks/useDataManager';

interface DataTableProps {
  onLocationSelect?: (location: Location) => void;
  onLocationEdit?: (location: Location) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  onLocationSelect,
  onLocationEdit,
}) => {
  const {
    locations,
    loading,
    error,
    selectedLocations,
    searchQuery,
    sortBy,
    sortOrder,
    filterBy,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    setFilterBy,
    selectAllLocations,
    clearSelection,
    toggleLocationSelection,
    deleteLocation,
    deleteLocations,
    exportLocations,
  } = useDataManager();

  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Filter and sort locations
  const filteredAndSortedLocations = useMemo(() => {
    let filtered = locations.filter(location => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!location.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Quantity filter
      if (filterBy === 'with_quantity') {
        return location.quantity !== undefined && location.quantity !== null;
      } else if (filterBy === 'without_quantity') {
        return location.quantity === undefined || location.quantity === null;
      }

      return true;
    });

    // Sort locations
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [locations, searchQuery, sortBy, sortOrder, filterBy]);

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
      } catch (err) {
        console.error('Failed to delete location:', err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLocations.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedLocations.size} locations?`)) {
      try {
        await deleteLocations(Array.from(selectedLocations));
        clearSelection();
      } catch (err) {
        console.error('Failed to delete locations:', err);
      }
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    exportLocations(format);
  };

  if (error) {
    return (
      <AlertRoot status="error">
        <AlertIndicator />
        <AlertContent>
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </AlertContent>
      </AlertRoot>
    );
  }

  return (
    <Box>
      {/* Header with controls */}
      <VStack align="stretch" gap={4} mb={6}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Data Management ({locations.length} locations)
          </Text>
          <HStack gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={loading}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport('json')}
              disabled={loading}
            >
              Export JSON
            </Button>
          </HStack>
        </HStack>

        {/* Search and filters */}
        <HStack gap={4} wrap="wrap">
          <HStack gap={2} flex="1" minW="300px">
            <MagnifyingGlassIcon className="h-4 w-4" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
            />
          </HStack>

          <HStack gap={2}>
            <FunnelIcon className="h-4 w-4" />
            <NativeSelectRoot size="sm" w="150px">
              <NativeSelectField
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
              >
                <option value="all">All Locations</option>
                <option value="with_quantity">With Quantity</option>
                <option value="without_quantity">Without Quantity</option>
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>
          </HStack>

          <HStack gap={2}>
            <Text fontSize="sm">Sort by:</Text>
            <NativeSelectRoot size="sm" w="120px">
              <NativeSelectField
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="name">Name</option>
                <option value="created_at">Created</option>
                <option value="updated_at">Updated</option>
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </HStack>
        </HStack>

        {/* Bulk actions */}
        {selectedLocations.size > 0 && (
          <HStack gap={2} p={3} bg="red.50" borderRadius="md">
            <Text fontSize="sm" color="red.700">
              {selectedLocations.size} selected
            </Text>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearSelection}
            >
              Clear Selection
            </Button>
          </HStack>
        )}
      </VStack>

      {/* Data table */}
      <Box overflowX="auto">
        <TableRoot size="sm">
          <TableHeader>
            <TableRow>
              <TableColumnHeader>
                <CheckboxRoot
                  isChecked={selectedLocations.size === filteredAndSortedLocations.length && filteredAndSortedLocations.length > 0}
                  isIndeterminate={selectedLocations.size > 0 && selectedLocations.size < filteredAndSortedLocations.length}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.checked) {
                      selectAllLocations();
                    } else {
                      clearSelection();
                    }
                  }}
                />
              </TableColumnHeader>
              <TableColumnHeader>Name</TableColumnHeader>
              <TableColumnHeader>Coordinates</TableColumnHeader>
              <TableColumnHeader>Quantity</TableColumnHeader>
              <TableColumnHeader>Created</TableColumnHeader>
              <TableColumnHeader>Updated</TableColumnHeader>
              <TableColumnHeader>Actions</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLocations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>
                  <CheckboxRoot
                    isChecked={selectedLocations.has(location.id)}
                    onChange={() => toggleLocationSelection(location.id)}
                  />
                </TableCell>
                <TableCell>
                  <Text fontWeight="medium">{location.name}</Text>
                </TableCell>
                <TableCell>
                  <Text fontSize="sm" color="gray.600">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </Text>
                </TableCell>
                <TableCell>
                  {location.quantity !== undefined && location.quantity !== null ? (
                    <Badge colorScheme="blue">{location.quantity}</Badge>
                  ) : (
                    <Text fontSize="sm" color="gray.400">—</Text>
                  )}
                </TableCell>
                <TableCell>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(location.created_at).toLocaleDateString()}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(location.updated_at).toLocaleDateString()}
                  </Text>
                </TableCell>
                <TableCell>
                  <HStack gap={1}>
                    <TooltipRoot label="Edit location">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        onClick={() => onLocationEdit?.(location)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                    </TooltipRoot>
                    <TooltipRoot label="Delete location">
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </TooltipRoot>
                  </HStack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </Box>

      {filteredAndSortedLocations.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">
            {searchQuery || filterBy !== 'all' 
              ? 'No locations match your filters'
              : 'No locations found'
            }
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
