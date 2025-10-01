// Script to export existing data and add dates
const fs = require('fs');
const path = require('path');

// Sample data structure (you'll need to replace this with actual data from the app)
const sampleLocations = [
  {
    "id": "1",
    "name": "New York City",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "quantity": 100,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": "2", 
    "name": "London",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "quantity": 85,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
];

// Generate random dates between 2024-01-01 and 2024-12-31
function generateRandomDate() {
  const start = new Date('2024-01-01');
  const end = new Date('2024-12-31');
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

// Add dates to locations
const locationsWithDates = sampleLocations.map(location => ({
  ...location,
  date: generateRandomDate()
}));

// Write to file
const outputPath = path.join(__dirname, '..', 'Downloads', 'Globe_Test_Data_With_Dates_Full.json');
fs.writeFileSync(outputPath, JSON.stringify(locationsWithDates, null, 2));

console.log(`✅ Created ${outputPath} with ${locationsWithDates.length} locations`);
console.log('📅 Added random dates to each location');
console.log('🛫 Ready for flight path testing!');
