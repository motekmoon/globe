#!/usr/bin/env node

/**
 * Pew Research to Globe Location Converter
 * Converts Pew Research survey data to globe-compatible format
 */

const fs = require('fs');
const path = require('path');

// Country code mapping based on Pew Research Global Attitudes Survey
// These are the numeric codes used in the dataset
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

function convertPewToGlobe(inputFile, outputFormat = 'json') {
  try {
    console.log('Reading Pew Research data...');
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n');
    
    // Skip header row
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log(`Processing ${dataLines.length} survey responses...`);
    
    // Extract unique countries
    const uniqueCountries = new Set();
    const countryCounts = {};
    
    dataLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length > 1) {
        const countryCode = columns[1].trim();
        if (countryCode && countryCode !== 'country' && countryCodeMapping[countryCode]) {
          uniqueCountries.add(countryCode);
          countryCounts[countryCode] = (countryCounts[countryCode] || 0) + 1;
        }
      }
    });
    
    console.log(`Found ${uniqueCountries.size} unique countries in the dataset`);
    
    // Convert to globe format
    const globeLocations = Array.from(uniqueCountries).map(countryCode => {
      const country = countryCodeMapping[countryCode];
      return {
        name: country.name,
        latitude: country.latitude,
        longitude: country.longitude,
        survey_responses: countryCounts[countryCode]
      };
    });
    
    // Sort by country name
    globeLocations.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('Globe locations created:');
    globeLocations.forEach(location => {
      console.log(`- ${location.name}: ${location.survey_responses} responses`);
    });
    
    // Generate output
    if (outputFormat === 'json') {
      const outputFile = inputFile.replace('.csv', '_globe_locations.json');
      fs.writeFileSync(outputFile, JSON.stringify(globeLocations, null, 2));
      console.log(`\n✅ JSON output saved to: ${outputFile}`);
    } else if (outputFormat === 'csv') {
      const outputFile = inputFile.replace('.csv', '_globe_locations.csv');
      const csvContent = [
        'name,latitude,longitude,survey_responses',
        ...globeLocations.map(loc => `"${loc.name}",${loc.latitude},${loc.longitude},${loc.survey_responses}`)
      ].join('\n');
      
      fs.writeFileSync(outputFile, csvContent);
      console.log(`\n✅ CSV output saved to: ${outputFile}`);
    }
    
    return globeLocations;
    
  } catch (error) {
    console.error('Error converting Pew data to globe format:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2] || 'Pew Research Center Global Attitudes Spring 2024 Dataset CSV.csv';
  const outputFormat = process.argv[3] || 'json';
  
  console.log('🌍 Pew Research to Globe Location Converter');
  console.log('==========================================');
  console.log(`Input file: ${inputFile}`);
  console.log(`Output format: ${outputFormat}`);
  console.log('');
  
  try {
    const result = convertPewToGlobe(inputFile, outputFormat);
    console.log(`\n🎉 Conversion completed successfully!`);
    console.log(`📊 Generated ${result.length} globe locations`);
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

module.exports = { convertPewToGlobe, countryCodeMapping };


