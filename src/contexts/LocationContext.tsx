import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Location, locationService } from '../lib/supabase';

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "updated_at">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterBy, setFilterBy] = useState<
    "all" | "with_quantity" | "without_quantity"
  >("all");
  const [columnMapping, setColumnMappingState] = useState<ColumnMapping>({});
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

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
      setColumnMappingState((prev) => ({
        ...prev,
        [columnName]: parameter,
      }));
    },
    []
  );

  const clearColumnMapping = useCallback((columnName: string) => {
    setColumnMappingState((prev) => {
      const newMapping = { ...prev };
      delete newMapping[columnName];
      return newMapping;
    });
  }, []);

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
