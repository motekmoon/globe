import { useState, useEffect } from 'react';
import { locationService, Location } from '../lib/supabase';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenLocations, setHiddenLocations] = useState<Set<string>>(new Set());
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // Load locations from Supabase on component mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await locationService.getLocations();
        setLocations(data);
      } catch (error) {
        console.error("Error loading locations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const handleLocationAdd = async (location: {
    name: string;
    lat: number;
    lng: number;
    quantity?: number;
  }) => {
    try {
      const newLocation = await locationService.addLocation({
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
        quantity: location.quantity,
      });

      if (newLocation) {
        setLocations((prev) => [newLocation, ...prev]);
      }
    } catch (error) {
      console.error("Error adding location:", error);
      // Fallback to local state if database fails
      const fallbackLocation = {
        id: Date.now().toString(),
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
        quantity: location.quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocations((prev) => [fallbackLocation, ...prev]);
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
  };

  const handleSaveLocation = async (updatedLocation: Location) => {
    try {
      // Update in database
      await locationService.updateLocation(updatedLocation.id, {
        name: updatedLocation.name,
        latitude: updatedLocation.latitude,
        longitude: updatedLocation.longitude,
        quantity: updatedLocation.quantity,
      });

      // Update local state
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === updatedLocation.id ? updatedLocation : loc
        )
      );
      setEditingLocation(null);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleHideLocation = (locationId: string) => {
    setHiddenLocations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      // Delete from database
      await locationService.deleteLocation(locationId);

      // Update local state
      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));

      // Remove from hidden locations if it was hidden
      setHiddenLocations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(locationId);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  const handleBulkImport = async (importedLocations: Location[]) => {
    try {
      const newLocations: Location[] = [];
      
      // Add each location to database
      for (const location of importedLocations) {
        try {
          const newLocation = await locationService.addLocation({
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            quantity: location.quantity,
          });
          
          if (newLocation) {
            newLocations.push(newLocation);
          }
        } catch (error) {
          console.error(`Error importing location ${location.name}:`, error);
          // Continue with other locations even if one fails
        }
      }

      // Update local state with all successfully imported locations
      if (newLocations.length > 0) {
        setLocations((prev) => [...newLocations, ...prev]);
      }

      return {
        success: newLocations.length,
        failed: importedLocations.length - newLocations.length,
        total: importedLocations.length
      };
    } catch (error) {
      console.error("Error during bulk import:", error);
      throw error;
    }
  };

  return {
    locations,
    loading,
    hiddenLocations,
    editingLocation,
    setEditingLocation,
    handleLocationAdd,
    handleEditLocation,
    handleSaveLocation,
    handleHideLocation,
    handleDeleteLocation,
    handleBulkImport,
  };
};
