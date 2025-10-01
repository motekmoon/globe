
// Open the browser console and run this to export current data
const exportData = async () => {
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('GlobeLocationsDB', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    const transaction = db.transaction(['locations'], 'readonly');
    const store = transaction.objectStore('locations');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const data = request.result;
      console.log('Current locations:', data.length);
      console.log('Sample location:', data[0]);
      
      // Copy this data and paste it into a file
      console.log('Copy this JSON data:');
      console.log(JSON.stringify(data, null, 2));
    };
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
  }
};

exportData();
