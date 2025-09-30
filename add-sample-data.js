// Add sample data to Globe application
// Run this in browser console at http://localhost:3003

const sampleLocations = [
  {
    id: 'sample-1',
    name: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    quantity: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sample-2', 
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    quantity: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sample-3',
    name: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    quantity: 120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sample-4',
    name: 'Sydney',
    latitude: -33.8688,
    longitude: 151.2093,
    quantity: 80,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sample-5',
    name: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    quantity: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Store in localStorage
localStorage.setItem('globe-locations', JSON.stringify(sampleLocations));

console.log('✅ Sample data added to localStorage');
console.log('📊 Added', sampleLocations.length, 'locations');
console.log('🔄 Refresh the page to see the data in Data Manager');

// Also try to add to IndexedDB if available
if (window.indexedDB) {
  console.log('💾 IndexedDB is available - data will be stored there on next page load');
}
