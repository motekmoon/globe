import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Location, locationService } from '../lib/supabase';
import { exportAllData, importData, saveBackupInfo } from "../utils/backup";

// Column mapping interface
interface ColumnMapping {
  [columnName: string]: string; // column -> visualization parameter
}

// Context state interface
interface LocationContextState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  hiddenLocations: Set<string>;
  editingLocation: Location | null;
  selectedLocations: Set<string>;
  searchQuery: string;
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
  filterBy: "all" | "with_quantity" | "without_quantity";
  columnMapping: ColumnMapping;
  availableColumns: string[];
  uiSettings: {
    drawerOpen: boolean;
    showQuantityVisualization: boolean;
    searchQuery: string;
    sortBy: "name" | "created_at" | "updated_at";
    sortOrder: "asc" | "desc";
    filterBy: "all" | "with_quantity" | "without_quantity";
  };
  updateUISettings: (
    updates: Partial<{
      drawerOpen: boolean;
      showQuantityVisualization: boolean;
      searchQuery: string;
      sortBy: "name" | "created_at" | "updated_at";
      sortOrder: "asc" | "desc";
      filterBy: "all" | "with_quantity" | "without_quantity";
    }>
  ) => void;
}

// Context actions interface
interface LocationContextActions {
  // Location CRUD operations
  addLocation: (
    location: Omit<Location, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  deleteLocations: (ids: string[]) => Promise<void>;

  // Bulk operations
  importLocations: (
    locations: Omit<Location, "id" | "created_at" | "updated_at">[]
  ) => Promise<{ success: number; failed: number }>;
  exportLocations: (format: "csv" | "json") => void;
  exportSelectedLocations: (format: "csv" | "json") => void;

  // Selection management
  selectLocation: (id: string) => void;
  selectAllLocations: () => void;
  clearSelection: () => void;
  toggleLocationSelection: (id: string) => void;

  // Filtering and sorting
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: "name" | "created_at" | "updated_at") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setFilterBy: (filter: "all" | "with_quantity" | "without_quantity") => void;

  // Globe-specific actions
  hideLocation: (id: string) => void;
  showLocation: (id: string) => void;
  setEditingLocation: (location: Location | null) => void;

  // Data refresh
  refreshData: () => Promise<void>;

  // Column mapping actions
  setColumnMapping: (columnName: string, parameter: string) => void;
  clearColumnMapping: (columnName: string) => void;
  updateAvailableColumns: (columns: string[]) => void;

  // Backup and restore
  exportCompleteBackup: () => void;
  importBackupData: (file: File) => Promise<void>;
}

// Combined context type
type LocationContextType = LocationContextState & LocationContextActions;

// Create context
const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

// Provider component
interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  // State
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hiddenLocations, setHiddenLocations] = useState<Set<string>>(
    new Set()
  );
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set()
  );

  // UI Settings with persistence (declared first)
  const [uiSettings, setUiSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("globe-ui-settings");
      return saved
        ? JSON.parse(saved)
        : {
            drawerOpen: false,
            showQuantityVisualization: false,
            searchQuery: "",
            sortBy: "name",
            sortOrder: "asc",
            filterBy: "all",
          };
    } catch (error) {
      console.warn("Failed to load UI settings from localStorage:", error);
      return {
        drawerOpen: false,
        showQuantityVisualization: false,
        searchQuery: "",
        sortBy: "name",
        sortOrder: "asc",
        filterBy: "all",
      };
    }
  });

  // Use persistent UI settings for state
  const [searchQuery, setSearchQuery] = useState(uiSettings.searchQuery);
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    uiSettings.sortBy
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    uiSettings.sortOrder
  );
  const [filterBy, setFilterBy] = useState<
    "all" | "with_quantity" | "without_quantity"
  >(uiSettings.filterBy);
  const [columnMapping, setColumnMappingState] = useState<ColumnMapping>(() => {
    // Load from localStorage on initialization
    try {
      const saved = localStorage.getItem("globe-column-mapping");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.warn("Failed to load column mapping from localStorage:", error);
      return {};
    }
  });
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  // Save column mapping to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "globe-column-mapping",
        JSON.stringify(columnMapping)
      );
      console.log("💾 Saved column mapping to localStorage:", columnMapping);
    } catch (error) {
      console.warn("Failed to save column mapping to localStorage:", error);
    }
  }, [columnMapping]);

  // Save UI settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("globe-ui-settings", JSON.stringify(uiSettings));
      console.log("💾 Saved UI settings to localStorage:", uiSettings);
    } catch (error) {
      console.warn("Failed to save UI settings to localStorage:", error);
    }
  }, [uiSettings]);

  // Helper functions to update UI settings
  const updateUISettings = useCallback(
    (updates: Partial<typeof uiSettings>) => {
      setUiSettings((prev: typeof uiSettings) => ({ ...prev, ...updates }));
    },
    []
  );

  // Sync state changes with UI settings
  useEffect(() => {
    updateUISettings({ searchQuery, sortBy, sortOrder, filterBy });
  }, [searchQuery, sortBy, sortOrder, filterBy, updateUISettings]);

  // Load all locations
  const refreshData = useCallback(async () => {
    console.log("🔄 LocationContext: Starting data refresh...");
    setLoading(true);
    setError(null);
    try {
      const allLocations = await locationService.getLocations();
      console.log(
        "📊 LocationContext: Loaded",
        allLocations.length,
        "locations from database"
      );
      setLocations(allLocations);
    } catch (err) {
      console.error("❌ LocationContext: Error loading locations:", err);
      setError(err instanceof Error ? err.message : "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load locations on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Apply saved column mapping to locations when both are loaded
  useEffect(() => {
    if (locations.length > 0 && Object.keys(columnMapping).length > 0) {
      console.log(
        "🔄 Applying saved column mapping to locations:",
        columnMapping
      );

      // Find quantity mapping
      const quantityColumn = Object.entries(columnMapping).find(
        ([_, param]) => param === "quantity"
      );

      if (quantityColumn) {
        const [columnName] = quantityColumn;
        console.log(`🔄 Restoring quantity mapping: ${columnName} → quantity`);

        setLocations((prevLocations) =>
          prevLocations.map((location) => {
            const mappedValue = (location as any)[columnName];
            if (mappedValue !== undefined && mappedValue !== null) {
              const numericValue = parseFloat(mappedValue);
              if (!isNaN(numericValue)) {
                return {
                  ...location,
                  quantity: numericValue,
                };
              }
            }
            return location;
          })
        );
      }
    }
  }, [locations, columnMapping]);

  // Add a single location
  const addLocation = useCallback(
    async (
      locationData: Omit<Location, "id" | "created_at" | "updated_at">
    ) => {
      setLoading(true);
      setError(null);
      try {
        const newLocation = await locationService.addLocation(locationData);
        if (newLocation) {
          setLocations((prev) => [newLocation, ...prev]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add location");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update a location
  const updateLocation = useCallback(
    async (id: string, updates: Partial<Location>) => {
      setLoading(true);
      setError(null);
      try {
        const updatedLocation = await locationService.updateLocation(
          id,
          updates
        );
        if (updatedLocation) {
          setLocations((prev) =>
            prev.map((loc) => (loc.id === id ? updatedLocation : loc))
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update location"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a single location
  const deleteLocation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await locationService.deleteLocation(id);
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
      setSelectedLocations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete location"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete multiple locations
  const deleteLocations = useCallback(async (ids: string[]) => {
    console.log("🗑️ Deleting locations:", ids.length, "IDs");
    setLoading(true);
    setError(null);

    let successCount = 0;
    let failCount = 0;

    try {
      // Process deletions one by one to avoid Promise.all failure
      for (const id of ids) {
        try {
          const result = await locationService.deleteLocation(id);
          if (result) {
            successCount++;
          } else {
            failCount++;
            console.warn("⚠️ Failed to delete location:", id);
          }
        } catch (err) {
          failCount++;
          console.error("❌ Error deleting location:", id, err);
        }
      }

      console.log(
        "📊 Delete results:",
        successCount,
        "successful,",
        failCount,
        "failed"
      );

      // Update UI state
      setLocations((prev) => prev.filter((loc) => !ids.includes(loc.id)));
      setSelectedLocations((prev) => {
        const newSet = new Set(prev);
        ids.forEach((id) => newSet.delete(id));
        return newSet;
      });

      if (failCount > 0) {
        setError(`${failCount} locations failed to delete`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete locations"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Import multiple locations
  const importLocations = useCallback(
    async (
      locationsData: Omit<Location, "id" | "created_at" | "updated_at">[]
    ) => {
      console.log(
        "🔄 LocationContext: Starting import of",
        locationsData.length,
        "locations"
      );
      setLoading(true);
      setError(null);
      let success = 0;
      let failed = 0;

      try {
        for (const locationData of locationsData) {
          try {
            const newLocation = await locationService.addLocation(locationData);
            if (newLocation) {
              setLocations((prev) => [newLocation, ...prev]);
              success++;
              if (success % 100 === 0) {
                console.log(
                  "📊 LocationContext: Imported",
                  success,
                  "locations so far..."
                );
              }
            } else {
              failed++;
            }
          } catch (err) {
            failed++;
            console.error("Failed to import location:", locationData, err);
          }
        }
        console.log(
          "✅ LocationContext: Completed - Success:",
          success,
          "Failed:",
          failed
        );
      } catch (err) {
        console.error("❌ LocationContext: Error during import:", err);
        setError(
          err instanceof Error ? err.message : "Failed to import locations"
        );
      } finally {
        setLoading(false);
      }

      return { success, failed };
    },
    []
  );

  // Export locations
  const exportLocations = useCallback(
    (format: "csv" | "json") => {
      if (format === "csv") {
        const csvContent = [
          "name,latitude,longitude,quantity,created_at,updated_at",
          ...locations.map(
            (loc) =>
              `"${loc.name}",${loc.latitude},${loc.longitude},${
                loc.quantity || ""
              },"${loc.created_at}","${loc.updated_at}"`
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "locations.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        const jsonContent = JSON.stringify(locations, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "locations.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    [locations]
  );

  // Export selected locations
  const exportSelectedLocations = useCallback(
    (format: "csv" | "json") => {
      const selectedData = locations.filter((loc) =>
        selectedLocations.has(loc.id)
      );

      if (format === "csv") {
        const csvContent = [
          "name,latitude,longitude,quantity,created_at,updated_at",
          ...selectedData.map(
            (loc) =>
              `"${loc.name}",${loc.latitude},${loc.longitude},${
                loc.quantity || ""
              },"${loc.created_at}","${loc.updated_at}"`
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `selected-locations-${selectedData.length}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        const jsonContent = JSON.stringify(selectedData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `selected-locations-${selectedData.length}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    [locations, selectedLocations]
  );

  // Backup and restore functions
  const exportCompleteBackup = useCallback(() => {
    try {
      exportAllData(locations, columnMapping, uiSettings);
      saveBackupInfo(new Date().toISOString());
      console.log("✅ Complete backup exported successfully");
    } catch (error) {
      console.error("❌ Failed to export backup:", error);
      throw error;
    }
  }, [locations, columnMapping, uiSettings]);

  const importBackupData = useCallback(
    async (file: File) => {
      try {
        const backupData = await importData(file);

        // Restore locations
        if (backupData.locations && backupData.locations.length > 0) {
          // Clear existing data using purgeAllData (development only)
          await locationService.purgeAllData();

          // Add each location individually
          for (const location of backupData.locations) {
            await locationService.addLocation(location);
          }

          await refreshData();
        }

        // Restore column mappings
        if (backupData.columnMapping) {
          setColumnMappingState(backupData.columnMapping);
        }

        // Restore UI settings
        if (backupData.uiSettings) {
          setUiSettings(backupData.uiSettings);
        }

        console.log("✅ Backup imported successfully:", {
          locations: backupData.locations.length,
          timestamp: backupData.metadata.timestamp,
        });
      } catch (error) {
        console.error("❌ Failed to import backup:", error);
        throw error;
      }
    },
    [refreshData]
  );

  // Selection management
  const selectLocation = useCallback((id: string) => {
    setSelectedLocations((prev) => new Set(Array.from(prev).concat(id)));
  }, []);

  const selectAllLocations = useCallback(() => {
    setSelectedLocations(new Set(locations.map((loc) => loc.id)));
  }, [locations]);

  const clearSelection = useCallback(() => {
    setSelectedLocations(new Set());
  }, []);
  const toggleLocationSelection = useCallback((id: string) => {
    setSelectedLocations((prev) => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Globe-specific actions
  const hideLocation = useCallback((id: string) => {
    setHiddenLocations((prev) => new Set(prev).add(id));
  }, []);

  const showLocation = useCallback((id: string) => {
    setHiddenLocations((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Column mapping actions
  const setColumnMapping = useCallback(
    (columnName: string, parameter: string) => {
      console.log(`🔧 setColumnMapping called: ${columnName} → ${parameter}`);
      setColumnMappingState((prev) => ({
        ...prev,
        [columnName]: parameter,
      }));

      console.log(`🔧 Column mapping updated: ${columnName} → ${parameter}`);

      // If mapping to quantity, update location.quantity field
      if (parameter === "quantity") {
        console.log(`🔄 Mapping column '${columnName}' to quantity field`);
        console.log(`📊 Sample location data:`, locations[0]);
        setLocations((prevLocations) =>
          prevLocations.map((location) => {
            const mappedValue = (location as any)[columnName];
            console.log(
              `🔍 Processing ${location.name}: ${columnName} = ${mappedValue}`
            );
            if (mappedValue !== undefined && mappedValue !== null) {
              const numericValue = parseFloat(mappedValue);
              if (!isNaN(numericValue)) {
                console.log(
                  `📊 Updated ${location.name}: ${mappedValue} → quantity: ${numericValue}`
                );
                return {
                  ...location,
                  quantity: numericValue,
                };
              } else {
                console.log(`❌ Invalid numeric value: ${mappedValue}`);
              }
            } else {
              console.log(
                `❌ No value found for ${columnName} in ${location.name}`
              );
            }
            return location;
          })
        );
      }

      // If mapping to flightPath, update location.date field
      if (parameter === "flightPath") {
        console.log(
          `🛫 Mapping column '${columnName}' to flight path date field`
        );
        setLocations((prevLocations) =>
          prevLocations.map((location) => {
            const mappedValue = (location as any)[columnName];
            console.log(
              `🔍 Processing ${location.name}: ${columnName} = ${mappedValue}`
            );
            if (mappedValue !== undefined && mappedValue !== null) {
              // Try to parse as date
              const dateValue = new Date(mappedValue);
              if (!isNaN(dateValue.getTime())) {
                console.log(
                  `🛫 Updated ${
                    location.name
                  }: ${mappedValue} → date: ${dateValue.toISOString()}`
                );
                return {
                  ...location,
                  date: mappedValue, // Keep original format for display
                };
              } else {
                console.log(`❌ Invalid date value: ${mappedValue}`);
              }
            } else {
              console.log(
                `❌ No value found for ${columnName} in ${location.name}`
              );
            }
            return location;
          })
        );
      }
    },
    [locations]
  );

  const clearColumnMapping = useCallback(
    (columnName: string) => {
      setColumnMappingState((prev) => {
        const newMapping = { ...prev };
        delete newMapping[columnName];
        return newMapping;
      });

      // If clearing a quantity mapping, reset quantity field to undefined
      const currentMapping = columnMapping[columnName];
      if (currentMapping === "quantity") {
        setLocations((prevLocations) =>
          prevLocations.map((location) => ({
            ...location,
            quantity: undefined,
          }))
        );
      }

      // If clearing a flightPath mapping, reset date field to undefined
      if (currentMapping === "flightPath") {
        setLocations((prevLocations) =>
          prevLocations.map((location) => ({
            ...location,
            date: undefined,
          }))
        );
      }
    },
    [columnMapping]
  );

  const updateAvailableColumns = useCallback((columns: string[]) => {
    setAvailableColumns(columns);
  }, []);

  // Context value
  const contextValue: LocationContextType = {
    // State
    locations,
    loading,
    error,
    hiddenLocations,
    editingLocation,
    selectedLocations,
    searchQuery,
    sortBy,
    sortOrder,
    filterBy,
    columnMapping,
    availableColumns,
    uiSettings,
    updateUISettings,

    // Actions
    addLocation,
    updateLocation,
    deleteLocation,
    deleteLocations,
    importLocations,
    exportLocations,
    exportSelectedLocations,
    selectLocation,
    selectAllLocations,
    clearSelection,
    toggleLocationSelection,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    setFilterBy,
    hideLocation,
    showLocation,
    setEditingLocation,
    refreshData,
    setColumnMapping,
    clearColumnMapping,
    updateAvailableColumns,
    exportCompleteBackup,
    importBackupData,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use the context
export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
