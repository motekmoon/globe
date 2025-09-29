#!/usr/bin/env node

/**
 * Enhanced Pew Research Converter
 * Adds latitude and longitude coordinates to the original Pew Research data
 */

const fs = require('fs');
const path = require('path');

// Country code mapping with coordinates
const countryCodeMapping = {
  '2': { name: 'Argentina', latitude: -34.6118, longitude: -58.3960 },
  '3': { name: 'Australia', latitude: -25.2744, longitude: 133.7751 },
  '4': { name: 'Bangladesh', latitude: 23.6850, longitude: 90.3563 },
  '5': { name: 'Brazil', latitude: -14.2350, longitude: -51.9253 },
  '6': { name: 'Canada', latitude: 56.1304, longitude: -106.3468 },
  '7': { name: 'Chile', latitude: -35.6751, longitude: -71.5430 },
  '8': { name: 'Colombia', latitude: 4.5709, longitude: -74.2973 },
  '9': { name: 'France', latitude: 46.2276, longitude: 2.2137 },
  '10': { name: 'Germany', latitude: 51.1657, longitude: 10.4515 },
  '11': { name: 'Ghana', latitude: 7.9465, longitude: -1.0232 },
  '12': { name: 'Greece', latitude: 39.0742, longitude: 21.8243 },
  '13': { name: 'Hungary', latitude: 47.1625, longitude: 19.5033 },
  '14': { name: 'India', latitude: 20.5937, longitude: 78.9629 },
  '15': { name: 'Indonesia', latitude: -0.7893, longitude: 113.9213 },
  '16': { name: 'Israel', latitude: 31.0461, longitude: 34.8516 },
  '17': { name: 'Italy', latitude: 41.8719, longitude: 12.5674 },
  '18': { name: 'Japan', latitude: 36.2048, longitude: 138.2529 },
  '19': { name: 'Kenya', latitude: -0.0236, longitude: 37.9062 },
  '20': { name: 'Malaysia', latitude: 4.2105, longitude: 101.9758 },
  '21': { name: 'Mexico', latitude: 23.6345, longitude: -102.5528 },
  '22': { name: 'Netherlands', latitude: 52.1326, longitude: 5.2913 },
  '23': { name: 'Nigeria', latitude: 9.081999, longitude: 8.675277 },
  '24': { name: 'Peru', latitude: -9.1900, longitude: -75.0152 },
  '25': { name: 'Philippines', latitude: 12.8797, longitude: 121.7740 },
  '26': { name: 'Poland', latitude: 51.9194, longitude: 19.1451 },
  '27': { name: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  '28': { name: 'South Africa', latitude: -30.5595, longitude: 22.9375 },
  '29': { name: 'South Korea', latitude: 35.9078, longitude: 127.7669 },
  '30': { name: 'Spain', latitude: 40.4637, longitude: -3.7492 },
  '31': { name: 'Sri Lanka', latitude: 7.8731, longitude: 80.7718 },
  '32': { name: 'Sweden', latitude: 60.1282, longitude: 18.6435 },
  '33': { name: 'Thailand', latitude: 15.8700, longitude: 100.9925 },
  '34': { name: 'Tunisia', latitude: 33.8869, longitude: 9.5375 },
  '35': { name: 'Turkey', latitude: 38.9637, longitude: 35.2433 },
  '36': { name: 'United Kingdom', latitude: 55.3781, longitude: -3.4360 }
};

function enhancePewDataWithCoordinates(inputFile, outputFile) {
  try {
    console.log('Reading original Pew Research data...');
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n');
    
    console.log(`Processing ${lines.length} lines...`);
    
    // Process header row - add new columns
    const headerLine = lines[0];
    const enhancedHeader = headerLine + ',country_name,latitude,longitude';
    
    // Process data rows
    const enhancedLines = [enhancedHeader];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const columns = line.split(',');
        const countryCode = columns[1] ? columns[1].trim() : '';
        
        if (countryCode && countryCodeMapping[countryCode]) {
          const country = countryCodeMapping[countryCode];
          const enhancedLine = line + `,"${country.name}",${country.latitude},${country.longitude}`;
          enhancedLines.push(enhancedLine);
        } else {
          // If no mapping found, add empty values
          const enhancedLine = line + ',,,';
          enhancedLines.push(enhancedLine);
        }
      }
    }
    
    // Write enhanced data
    const enhancedData = enhancedLines.join('\n');
    fs.writeFileSync(outputFile, enhancedData);
    
    console.log(`✅ Enhanced data saved to: ${outputFile}`);
    console.log(`📊 Added columns: country_name, latitude, longitude`);
    
    // Show sample of enhanced data
    console.log('\n📋 Sample of enhanced data:');
    const sampleLines = enhancedLines.slice(0, 5);
    sampleLines.forEach((line, index) => {
      console.log(`${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    });
    
    return enhancedLines.length - 1; // Return number of data rows (excluding header)
    
  } catch (error) {
    console.error('Error enhancing Pew data:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2] || 'Pew Research Center Global Attitudes Spring 2024 Dataset CSV.csv';
  const outputFile = process.argv[3] || 'Pew Religion Sample Data.csv';
  
  console.log('🔍 Enhanced Pew Research Data Converter');
  console.log('=====================================');
  console.log(`Input file: ${inputFile}`);
  console.log(`Output file: ${outputFile}`);
  console.log('');
  
  try {
    const rowCount = enhancePewDataWithCoordinates(inputFile, outputFile);
    console.log(`\n🎉 Enhancement completed successfully!`);
    console.log(`📊 Processed ${rowCount} data rows`);
    console.log(`🌍 Added coordinates for all countries`);
  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
    process.exit(1);
  }
}

module.exports = { enhancePewDataWithCoordinates, countryCodeMapping };

