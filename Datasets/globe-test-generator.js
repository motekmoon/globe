#!/usr/bin/env node

/**
 * Globe Test Dataset Generator
 * Creates a simple test dataset with mixed data types for Globe visualization testing
 */

const fs = require('fs');
const path = require('path');

function generateGlobeTestData(outputFile) {
  try {
    console.log('🌍 Globe Test Dataset Generator');
    console.log('================================');
    console.log(`Output file: ${outputFile}`);
    console.log('');
    
    // Define column headers with mixed data types
    const headers = [
      'country_name',      // String - Country names
      'latitude',          // Number - Geographic coordinates
      'longitude',         // Number - Geographic coordinates
      'population',        // Integer - Population numbers
      'temperature',       // Number - Temperature with decimals
      'is_capital',        // Boolean - True/False values
      'founded_year',      // Integer - Historical dates
      'continent',         // String - Categorical data
      'gdp_per_capita',    // Number - Economic data with decimals
      'last_updated'       // Date - ISO date strings
    ];
    
    console.log('📊 Column types:');
    console.log('  - country_name: String');
    console.log('  - latitude: Number (-90 to 90)');
    console.log('  - longitude: Number (-180 to 180)');
    console.log('  - population: Integer (1000 to 50M)');
    console.log('  - temperature: Number (-50 to 50)');
    console.log('  - is_capital: Boolean (true/false)');
    console.log('  - founded_year: Integer (1800-2020)');
    console.log('  - continent: String (categorical)');
    console.log('  - gdp_per_capita: Number (1000-100000)');
    console.log('  - last_updated: Date (ISO format)');
    console.log('');
    
    // Sample data for realistic values
    const countries = [
      'United States', 'China', 'India', 'Brazil', 'Russia', 'Japan', 'Germany', 'United Kingdom',
      'France', 'Italy', 'Canada', 'Australia', 'South Korea', 'Spain', 'Mexico', 'Indonesia',
      'Netherlands', 'Saudi Arabia', 'Turkey', 'Switzerland', 'Belgium', 'Israel', 'Austria',
      'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Greece',
      'Portugal', 'Ireland', 'New Zealand', 'Chile', 'Argentina', 'Colombia', 'Peru', 'Venezuela',
      'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Algeria', 'Tunisia', 'Ghana',
      'Thailand', 'Malaysia', 'Singapore', 'Philippines', 'Vietnam', 'Bangladesh', 'Pakistan',
      'Sri Lanka', 'Nepal', 'Myanmar', 'Cambodia', 'Laos', 'Mongolia', 'Kazakhstan', 'Uzbekistan',
      'Ukraine', 'Romania', 'Bulgaria', 'Croatia', 'Slovenia', 'Slovakia', 'Lithuania', 'Latvia',
      'Estonia', 'Iceland', 'Luxembourg', 'Malta', 'Cyprus', 'Monaco', 'Liechtenstein', 'Andorra',
      'San Marino', 'Vatican City', 'Iceland', 'Greenland', 'Faroe Islands', 'Bermuda', 'Bahamas',
      'Jamaica', 'Cuba', 'Haiti', 'Dominican Republic', 'Puerto Rico', 'Trinidad and Tobago',
      'Barbados', 'Grenada', 'Saint Lucia', 'Antigua and Barbuda', 'Saint Kitts and Nevis'
    ];
    
    const continents = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Antarctica'];
    
    // Generate 99 records
    const records = [];
    for (let i = 1; i <= 99; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const continent = continents[Math.floor(Math.random() * continents.length)];
      
      const record = [
        `"${country}"`,                                    // country_name (String)
        (Math.random() * 180 - 90).toFixed(6),            // latitude (Number)
        (Math.random() * 360 - 180).toFixed(6),           // longitude (Number)
        Math.floor(Math.random() * 50000000) + 1000,      // population (Integer)
        (Math.random() * 100 - 50).toFixed(2),           // temperature (Number)
        Math.random() > 0.5 ? 'true' : 'false',          // is_capital (Boolean)
        Math.floor(Math.random() * 220) + 1800,           // founded_year (Integer)
        `"${continent}"`,                                  // continent (String)
        (Math.random() * 99000 + 1000).toFixed(2),       // gdp_per_capita (Number)
        `"${new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]}"` // last_updated (Date)
      ];
      
      records.push(record.join(','));
    }
    
    // Create CSV content
    const csvContent = [headers.join(','), ...records].join('\n');
    
    // Write file
    fs.writeFileSync(outputFile, csvContent);
    
    // Check final size
    const stats = fs.statSync(outputFile);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`✅ Test dataset created successfully!`);
    console.log(`📁 File: ${outputFile}`);
    console.log(`📊 Records: 99`);
    console.log(`📋 Columns: 10`);
    console.log(`💾 Size: ${sizeKB}KB`);
    
    // Show sample data
    console.log('\n📋 Sample data:');
    const sampleLines = csvContent.split('\n').slice(0, 6);
    sampleLines.forEach((line, index) => {
      if (index === 0) {
        console.log(`Header: ${line.substring(0, 100)}...`);
      } else {
        console.log(`Row ${index}: ${line.substring(0, 100)}...`);
      }
    });
    
    console.log('\n🎯 Data type summary:');
    console.log('  ✅ String: country_name, continent');
    console.log('  ✅ Number: latitude, longitude, temperature, gdp_per_capita');
    console.log('  ✅ Integer: population, founded_year');
    console.log('  ✅ Boolean: is_capital');
    console.log('  ✅ Date: last_updated');
    console.log('  ✅ Geographic: latitude, longitude');
    
    return {
      records: 99,
      columns: 10,
      sizeKB: parseFloat(sizeKB)
    };
    
  } catch (error) {
    console.error('Error generating test data:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const outputFile = process.argv[2] || 'Globe Test Dataset.csv';
  
  try {
    const result = generateGlobeTestData(outputFile);
    console.log(`\n🎉 Globe test dataset ready!`);
    console.log(`📊 Perfect for testing Globe Data Manager with mixed data types`);
    console.log(`🌍 ${result.records} records with ${result.columns} columns`);
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

module.exports = { generateGlobeTestData };
