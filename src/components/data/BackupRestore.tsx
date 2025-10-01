import React, { useRef, useState } from 'react';
import { useLocations } from '../../hooks/useLocations';

const BackupRestore: React.FC = () => {
  const { exportCompleteBackup, importBackupData } = useLocations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    try {
      exportCompleteBackup();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      await importBackupData(file);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="backup-restore-container" style={{ 
      display: 'flex', 
      gap: '8px', 
      alignItems: 'center',
      padding: '8px',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9'
    }}>
      <button
        onClick={handleExport}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
        title="Save complete project (locations + settings)"
      >
        💾 Save Project
      </button>

      <button
        onClick={triggerFileInput}
        disabled={isImporting}
        style={{
          padding: '8px 16px',
          backgroundColor: isImporting ? '#ccc' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isImporting ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
        title="Load project file to restore data"
      >
        {isImporting ? '⏳ Loading...' : '📂 Load Project'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {importError && (
        <div style={{
          color: '#f44336',
          fontSize: '12px',
          marginLeft: '8px',
          maxWidth: '200px'
        }}>
          ❌ {importError}
        </div>
      )}
    </div>
  );
};

export default BackupRestore;
