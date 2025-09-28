import React, { useMemo, useEffect, useCallback } from "react";
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
  Badge,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
} from "@chakra-ui/react";
// Icons removed
import { Location } from "../../lib/supabase";
import { useDataManager } from "../../hooks/useDataManager";
import ColumnSelector from "./ColumnSelector";

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
    exportSelectedLocations,
    columnMapping,
    availableColumns,
    setColumnMapping,
    clearColumnMapping,
    updateAvailableColumns,
  } = useDataManager();

  // Get all available columns from the data
  const getAllColumns = useCallback(() => {
    if (locations.length === 0) return [];

    // Get all unique keys from all locations
    const allKeys = new Set<string>();
    locations.forEach((location) => {
      Object.keys(location).forEach((key) => {
        if (key !== "id" && key !== "created_at" && key !== "updated_at") {
          allKeys.add(key);
        }
      });
    });

    const columns = Array.from(allKeys).sort();
    return columns;
  }, [locations]);

  // Update available columns when locations change
  useEffect(() => {
    const columns = getAllColumns();
    console.log("🔍 DataTable Debug:", {
      locationsCount: locations.length,
      detectedColumns: columns,
      currentAvailableColumns: availableColumns,
      sampleLocation: locations[0],
    });

    if (
      columns.length > 0 &&
      JSON.stringify(columns) !== JSON.stringify(availableColumns)
    ) {
      console.log("📊 Updating available columns:", columns);
      updateAvailableColumns(columns);
    }
  }, [locations, getAllColumns, availableColumns, updateAvailableColumns]);

  // Filter and sort locations
  const filteredAndSortedLocations = useMemo(() => {
    let filtered = locations.filter((location) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!location.name?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Quantity filter
      if (filterBy === "with_quantity") {
        return location.quantity !== undefined && location.quantity !== null;
      } else if (filterBy === "without_quantity") {
        return location.quantity === undefined || location.quantity === null;
      }

      return true;
    });

    // Sort locations
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "updated_at":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [locations, searchQuery, sortBy, sortOrder, filterBy]);

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteLocation(id);
      } catch (err) {
        console.error("Failed to delete location:", err);
      }
    }
  };

  const handleBulkDelete = useCallback(async () => {
    if (selectedLocations.size === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedLocations.size} locations?`
      )
    ) {
      try {
        await deleteLocations(Array.from(selectedLocations));
        clearSelection();
      } catch (err) {
        console.error("Failed to delete locations:", err);
      }
    }
  }, [selectedLocations, deleteLocations, clearSelection]);

  // Keyboard shortcuts for bulk operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl+A or Cmd+A: Select all
      if ((event.ctrlKey || event.metaKey) && event.key === "a") {
        event.preventDefault();
        selectAllLocations();
      }

      // Delete: Delete selected (if any selected)
      if (event.key === "Delete" && selectedLocations.size > 0) {
        event.preventDefault();
        handleBulkDelete();
      }

      // Escape: Clear selection
      if (event.key === "Escape") {
        clearSelection();
      }

      // Ctrl+E or Cmd+E: Export selected
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "e" &&
        selectedLocations.size > 0
      ) {
        event.preventDefault();
        exportSelectedLocations("csv");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedLocations.size,
    selectAllLocations,
    clearSelection,
    handleBulkDelete,
    exportSelectedLocations,
  ]);

  const handleExport = (format: "csv" | "json") => {
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

        {/* Search and filters */}
        <HStack gap={4} wrap="wrap">
          <HStack gap={2} flex="1" minW="300px">
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
            />
          </HStack>

          <HStack gap={2}>
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
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </HStack>
        </HStack>

        {/* Enhanced Bulk actions */}
        {selectedLocations.size > 0 && (
          <HStack
            gap={3}
            p={4}
            bg="blue.50"
            borderRadius="md"
            border="1px solid"
            borderColor="blue.200"
          >
            <HStack gap={2}>
              <Text fontSize="sm" fontWeight="medium" color="blue.700">
                {selectedLocations.size} selected
              </Text>
              <Badge colorScheme="blue" variant="subtle">
                {Math.round(
                  (selectedLocations.size / filteredAndSortedLocations.length) *
                    100
                )}
                %
              </Badge>
            </HStack>

            <HStack gap={2}>
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={handleBulkDelete}
              >
                🗑️ Delete
              </Button>

              <HStack gap={1}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => exportSelectedLocations("csv")}
                >
                  📄 CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => exportSelectedLocations("json")}
                >
                  📋 JSON
                </Button>
              </HStack>

              <Button size="sm" variant="outline" onClick={clearSelection}>
                ✖️ Clear
              </Button>
            </HStack>

            <Text fontSize="xs" color="blue.600" opacity={0.8}>
              💡 Ctrl+A: Select All | Delete: Delete | Ctrl+E: Export | Esc:
              Clear
            </Text>
          </HStack>
        )}
      </VStack>

      {/* Data table */}
      <Box overflowX="auto">
        <TableRoot size="sm">
          <TableHeader>
            <TableRow>
              <TableColumnHeader>
                <VStack gap={1} align="start">
                  <Text fontSize="sm" fontWeight="semibold" opacity={0}>
                    Select All
                  </Text>
                  <Box display="flex" justifyContent="flex-start">
                    <input
                      type="checkbox"
                      style={{
                        border: '5px solid #000',
                        transform: 'scale(1.2)'
                      }}
                      checked={
                        selectedLocations.size ===
                          filteredAndSortedLocations.length &&
                        filteredAndSortedLocations.length > 0
                      }
                      ref={(input) => {
                        if (input) {
                          input.indeterminate =
                            selectedLocations.size > 0 &&
                            selectedLocations.size <
                              filteredAndSortedLocations.length;
                        }
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (e.target.checked) {
                          selectAllLocations();
                        } else {
                          clearSelection();
                        }
                      }}
                    />
                  </Box>
                </VStack>
              </TableColumnHeader>
              {/* Dynamic column headers */}
              {availableColumns.map((column) => (
                <TableColumnHeader key={column}>
                  <VStack gap={1} align="start">
                    <Text fontSize="sm" fontWeight="semibold">
                      {column}
                    </Text>
                    <ColumnSelector
                      columnName={column}
                      currentMapping={columnMapping[column] || ""}
                      onMappingChange={(col, param) => {
                        if (param === "") {
                          clearColumnMapping(col);
                        } else {
                          setColumnMapping(col, param);
                        }
                      }}
                    />
                  </VStack>
                </TableColumnHeader>
              ))}
              <TableColumnHeader>Actions</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLocations.map((location) => (
              <TableRow key={location.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedLocations.has(location.id)}
                    onChange={() => toggleLocationSelection(location.id)}
                  />
                </TableCell>
                {/* Dynamic column cells */}
                {availableColumns.map((column) => {
                  const value = (location as any)[column];
                  const isMapped = columnMapping[column];

                  return (
                    <TableCell key={column}>
                      {value !== undefined && value !== null ? (
                        <Box>
                          <Text fontSize="sm">
                            {typeof value === "number"
                              ? value.toFixed(2)
                              : String(value)}
                          </Text>
                          {isMapped && (
                            <Badge size="sm" colorScheme="green" mt={1}>
                              {isMapped}
                            </Badge>
                          )}
                        </Box>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          —
                        </Text>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <HStack gap={1}>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onLocationEdit?.(location)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      Delete
                    </Button>
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
            {searchQuery || filterBy !== "all"
              ? "No locations match your filters"
              : "No locations found"}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default DataTable;
