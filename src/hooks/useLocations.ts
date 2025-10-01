import { useLocationContext } from '../contexts/LocationContext';
import { Location } from '../lib/supabase';

export const useLocations = () => {
  const context = useLocationContext();
  const {
    locations,
    loading,
    hiddenLocations,
    editingLocation,
    addLocation,
    updateLocation,
    deleteLocation,
    hideLocation,
    showLocation,
    setEditingLocation,
    importLocations,
    columnMapping,
    uiSettings,
    updateUISettings,
    exportCompleteBackup,
    importBackupData,
  } = context;

  const handleLocationAdd = async (location: {
    name: string;
    lat: number;
    lng: number;
    quantity?: number;
  }) => {
    try {
      await addLocation({
        name: location.name,
        latitude: location.lat,
        longitude: location.lng,
        quantity: location.quantity,
      });
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
  };

  const handleSaveLocation = async (updatedLocation: Location) => {
    try {
      await updateLocation(updatedLocation.id, updatedLocation);
      setEditingLocation(null);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleHideLocation = (locationId: string) => {
    hideLocation(locationId);
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteLocation(locationId);
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  const handleBulkImport = async (importedLocations: Location[]) => {
    try {
      const locationData = importedLocations.map(location => ({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        quantity: location.quantity,
      }));
      
      const result = await context.importLocations(locationData);
      return {
        success: result.success,
        failed: result.failed,
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
    columnMapping,
    uiSettings,
    updateUISettings,
    exportCompleteBackup,
    importBackupData,
  };
};
