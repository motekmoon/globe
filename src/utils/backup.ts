import { Location } from '../lib/supabase';

export interface BackupData {
  locations: Location[];
  columnMapping: { [key: string]: string };
  uiSettings: {
    drawerOpen: boolean;
    showQuantityVisualization: boolean;
    searchQuery: string;
    sortBy: 'name' | 'created_at' | 'updated_at';
    sortOrder: 'asc' | 'desc';
    filterBy: 'all' | 'with_quantity' | 'without_quantity';
  };
  metadata: {
    timestamp: string;
    version: string;
    recordCount: number;
    appVersion: string;
  };
}

/**
 * Export all application data to a downloadable backup file
 */
export const exportAllData = (
  locations: Location[],
  columnMapping: { [key: string]: string },
  uiSettings: any
): void => {
  try {
    const backupData: BackupData = {
      locations,
      columnMapping,
      uiSettings,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        recordCount: locations.length,
        appVersion: 'Globe v1.0'
      }
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `globe-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup exported successfully:', {
      recordCount: locations.length,
      timestamp: backupData.metadata.timestamp
    });
    
  } catch (error) {
    console.error('❌ Failed to export backup:', error);
    throw new Error('Failed to create backup file');
  }
};

/**
 * Import data from a backup file
 */
export const importData = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backupData: BackupData = JSON.parse(content);
        
        // Validate backup data structure
        if (!validateBackupData(backupData)) {
          throw new Error('Invalid backup file format');
        }
        
        console.log('✅ Backup imported successfully:', {
          recordCount: backupData.locations.length,
          timestamp: backupData.metadata.timestamp,
          version: backupData.metadata.version
        });
        
        resolve(backupData);
        
      } catch (error) {
        console.error('❌ Failed to import backup:', error);
        reject(new Error('Invalid or corrupted backup file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read backup file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validate backup data structure
 */
const validateBackupData = (data: any): data is BackupData => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.locations) &&
    typeof data.columnMapping === 'object' &&
    typeof data.uiSettings === 'object' &&
    typeof data.metadata === 'object' &&
    typeof data.metadata.timestamp === 'string' &&
    typeof data.metadata.version === 'string' &&
    typeof data.metadata.recordCount === 'number'
  );
};

/**
 * Get backup file info from localStorage (if exists)
 */
export const getBackupInfo = (): { lastBackup?: string; hasBackup: boolean } => {
  try {
    const lastBackup = localStorage.getItem('globe-last-backup');
    return {
      lastBackup: lastBackup || undefined,
      hasBackup: !!lastBackup
    };
  } catch (error) {
    console.warn('Failed to get backup info:', error);
    return { hasBackup: false };
  }
};

/**
 * Save backup info to localStorage
 */
export const saveBackupInfo = (timestamp: string): void => {
  try {
    localStorage.setItem('globe-last-backup', timestamp);
  } catch (error) {
    console.warn('Failed to save backup info:', error);
  }
};
