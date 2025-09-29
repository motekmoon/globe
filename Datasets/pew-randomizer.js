#!/usr/bin/env node

/**
 * Pew Research Coordinate Randomizer
 * Creates a version with randomized coordinates spread across the world
 */

const fs = require('fs');
const path = require('path');

function randomizeCoordinates(inputFile, outputFile) {
  try {
    console.log('🌍 Pew Research Coordinate Randomizer');
    console.log('=====================================');
    console.log(`Input file: ${inputFile}`);
    console.log(`Output file: ${outputFile}`);
    console.log('');
    
    // Read the original file
    console.log('Reading tiny dataset...');
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n');
    
    console.log(`Processing ${lines.length} lines...`);
    
    // Process header row
    const headerLine = lines[0];
    const randomizedLines = [headerLine];
    
    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const columns = line.split(',');
        
        // Generate random coordinates
        const randomLat = (Math.random() * 180 - 90).toFixed(6); // -90 to 90
        const randomLng = (Math.random() * 360 - 180).toFixed(6); // -180 to 180
        
        // Replace the last 3 columns (country_name, latitude, longitude)
        const newColumns = columns.slice(0, -3);
        newColumns.push(`"Random Location ${i}"`, randomLat, randomLng);
        
        const randomizedLine = newColumns.join(',');
        randomizedLines.push(randomizedLine);
      }
    }
    
    // Write randomized data
    const randomizedData = randomizedLines.join('\n');
    fs.writeFileSync(outputFile, randomizedData);
    
    // Check final size
    const stats = fs.statSync(outputFile);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const finalLines = randomizedLines.length;
    
    console.log(`✅ Randomized file created successfully!`);
    console.log(`📁 File: ${outputFile}`);
    console.log(`📊 Lines: ${finalLines}`);
    console.log(`💾 Size: ${sizeKB}KB`);
    
    // Show sample coordinates
    console.log('\n🌍 Sample randomized coordinates:');
    for (let i = 1; i <= Math.min(5, randomizedLines.length - 1); i++) {
      const line = randomizedLines[i];
      const columns = line.split(',');
      const name = columns[columns.length - 3];
      const lat = columns[columns.length - 2];
      const lng = columns[columns.length - 1];
      console.log(`  ${i}: ${name} at (${lat}, ${lng})`);
    }
    
    return {
      lines: finalLines,
      sizeKB: parseFloat(sizeKB)
    };
    
  } catch (error) {
    console.error('Error randomizing coordinates:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2] || 'Pew Religion Sample Data - Tiny.csv';
  const outputFile = process.argv[3] || 'Pew Religion Sample Data - Random.csv';
  
  try {
    const result = randomizeCoordinates(inputFile, outputFile);
    console.log(`\n🎉 Randomization completed successfully!`);
    console.log(`📊 Generated ${result.lines} lines with random global coordinates`);
    console.log(`🌍 Coordinates spread across the entire world!`);
  } catch (error) {
    console.error('❌ Randomization failed:', error.message);
    process.exit(1);
  }
}

module.exports = { randomizeCoordinates };

