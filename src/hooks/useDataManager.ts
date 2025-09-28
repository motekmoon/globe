import { useState, useCallback } from 'react';
import { Location } from '../lib/supabase';
import { locationService } from '../lib/supabase';

export interface DataManagerState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  selectedLocations: Set<string>;
  searchQuery: string;
  sortBy: 'name' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  filterBy: 'all' | 'with_quantity' | 'without_quantity';
}

export interface DataManagerActions {
  // Location CRUD operations
  addLocation: (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLocation: (id: string, updates: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  deleteLocations: (ids: string[]) => Promise<void>;
  
  // Bulk operations
  importLocations: (locations: Omit<Location, 'id' | 'created_at' | 'updated_at'>[]) => Promise<{success: number, failed: number}>;
  exportLocations: (format: 'csv' | 'json') => void;
  
  // Selection management
  selectLocation: (id: string) => void;
  selectAllLocations: () => void;
  clearSelection: () => void;
  toggleLocationSelection: (id: string) => void;
  
  // Filtering and sorting
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'name' | 'created_at' | 'updated_at') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFilterBy: (filter: 'all' | 'with_quantity' | 'without_quantity') => void;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

export const useDataManager = (): DataManagerState & DataManagerActions => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | 'with_quantity' | 'without_quantity'>('all');

  // Load all locations
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allLocations = await locationService.getLocations();
      setLocations(allLocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a single location
  const addLocation = useCallback(async (locationData: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const newLocation = await locationService.addLocation(locationData);
      if (newLocation) {
        setLocations(prev => [...prev, newLocation]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a location
  const updateLocation = useCallback(async (id: string, updates: Partial<Location>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedLocation = await locationService.updateLocation(id, updates);
      if (updatedLocation) {
        setLocations(prev => prev.map(loc => loc.id === id ? updatedLocation : loc));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a single location
  const deleteLocation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await locationService.deleteLocation(id);
      setLocations(prev => prev.filter(loc => loc.id !== id));
      setSelectedLocations(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete multiple locations
  const deleteLocations = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all(ids.map(id => locationService.deleteLocation(id)));
      setLocations(prev => prev.filter(loc => !ids.includes(loc.id)));
      setSelectedLocations(prev => {
        const newSet = new Set(prev);
        ids.forEach(id => newSet.delete(id));
        return newSet;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete locations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Import multiple locations
  const importLocations = useCallback(async (locationsData: Omit<Location, 'id' | 'created_at' | 'updated_at'>[]) => {
    setLoading(true);
    setError(null);
    let success = 0;
    let failed = 0;

    try {
      for (const locationData of locationsData) {
        try {
          const newLocation = await locationService.addLocation(locationData);
          if (newLocation) {
            setLocations(prev => [...prev, newLocation]);
            success++;
          } else {
            failed++;
          }
        } catch (err) {
          failed++;
          console.error('Failed to import location:', locationData, err);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import locations');
    } finally {
      setLoading(false);
    }

    return { success, failed };
  }, []);

  // Export locations
  const exportLocations = useCallback((format: 'csv' | 'json') => {
    if (format === 'csv') {
      const csvContent = [
        'name,latitude,longitude,quantity,created_at,updated_at',
        ...locations.map(loc => 
          `"${loc.name}",${loc.latitude},${loc.longitude},${loc.quantity || ''},"${loc.created_at}","${loc.updated_at}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'locations.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(locations, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'locations.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [locations]);

  // Selection management
  const selectLocation = useCallback((id: string) => {
    setSelectedLocations(prev => new Set(Array.from(prev).concat(id)));
  }, []);

  const selectAllLocations = useCallback(() => {
    setSelectedLocations(new Set(locations.map(loc => loc.id)));
  }, [locations]);

  const clearSelection = useCallback(() => {
    setSelectedLocations(new Set());
  }, []);

  const toggleLocationSelection = useCallback((id: string) => {
    setSelectedLocations(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  return {
    // State
    locations,
    loading,
    error,
    selectedLocations,
    searchQuery,
    sortBy,
    sortOrder,
    filterBy,
    
    // Actions
    addLocation,
    updateLocation,
    deleteLocation,
    deleteLocations,
    importLocations,
    exportLocations,
    selectLocation,
    selectAllLocations,
    clearSelection,
    toggleLocationSelection,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    setFilterBy,
    refreshData,
  };
};
