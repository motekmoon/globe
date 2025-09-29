// Data Purge Script for Globe App
// This script will clear all data from IndexedDB and localStorage

console.log('🗑️ Starting data purge...');

// Clear localStorage
try {
  localStorage.removeItem('globe-locations');
  console.log('✅ localStorage cleared');
} catch (error) {
  console.error('❌ Error clearing localStorage:', error);
}

// Clear IndexedDB
async function clearIndexedDB() {
  try {
    // Open the database
    const request = indexedDB.open('GlobeLocationsDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['locations'], 'readwrite');
      const store = transaction.objectStore('locations');
      
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        console.log('✅ IndexedDB cleared successfully');
        db.close();
      };
      
      clearRequest.onerror = () => {
        console.error('❌ Error clearing IndexedDB:', clearRequest.error);
        db.close();
      };
    };
    
    request.onerror = () => {
      console.error('❌ Error opening IndexedDB:', request.error);
    };
  } catch (error) {
    console.error('❌ Error clearing IndexedDB:', error);
  }
}

// Run the purge
clearIndexedDB();

console.log('🎯 Data purge completed!');
console.log('📝 Note: Refresh the page to see the changes');

