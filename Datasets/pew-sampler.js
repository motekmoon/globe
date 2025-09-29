#!/usr/bin/env node

/**
 * Pew Research Data Sampler
 * Creates a smaller version of the Pew Religion Sample Data under size and line limits
 */

const fs = require('fs');
const path = require('path');

function createSampleData(inputFile, outputFile, maxLines = 1000, maxSizeMB = 10) {
  try {
    console.log('📊 Pew Research Data Sampler');
    console.log('============================');
    console.log(`Input file: ${inputFile}`);
    console.log(`Output file: ${outputFile}`);
    console.log(`Max lines: ${maxLines}`);
    console.log(`Max size: ${maxSizeMB}MB`);
    console.log('');
    
    // Read the original file
    console.log('Reading original data...');
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n');
    
    console.log(`Original file: ${lines.length} lines`);
    
    // Keep header and sample data
    const header = lines[0];
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log(`Data rows: ${dataLines.length}`);
    
    // Calculate sampling rate to get approximately maxLines
    const targetDataRows = maxLines - 1; // -1 for header
    const samplingRate = Math.min(1, targetDataRows / dataLines.length);
    const step = Math.max(1, Math.floor(1 / samplingRate));
    
    console.log(`Sampling rate: ${(samplingRate * 100).toFixed(1)}%`);
    console.log(`Taking every ${step}th row`);
    
    // Sample data while ensuring we get representatives from each country
    const sampledLines = [header];
    const countryCounts = {};
    const maxPerCountry = Math.ceil(targetDataRows / 35); // 35 countries, distribute evenly
    
    console.log(`Max per country: ${maxPerCountry}`);
    
    // First pass: collect country distribution
    dataLines.forEach(line => {
      const columns = line.split(',');
      const countryCode = columns[1] ? columns[1].trim() : '';
      if (countryCode && countryCode !== 'country') {
        countryCounts[countryCode] = (countryCounts[countryCode] || 0) + 1;
      }
    });
    
    console.log('Country distribution in original data:');
    Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([country, count]) => {
        console.log(`  Country ${country}: ${count} responses`);
      });
    
    // Second pass: sample data
    const countrySampled = {};
    let totalSampled = 0;
    
    for (let i = 0; i < dataLines.length && totalSampled < targetDataRows; i++) {
      const line = dataLines[i];
      const columns = line.split(',');
      const countryCode = columns[1] ? columns[1].trim() : '';
      
      if (countryCode && countryCode !== 'country') {
        const currentCount = countrySampled[countryCode] || 0;
        
        // Sample if we haven't exceeded the limit for this country
        if (currentCount < maxPerCountry) {
          sampledLines.push(line);
          countrySampled[countryCode] = currentCount + 1;
          totalSampled++;
        }
      }
    }
    
    console.log(`\nSampled ${totalSampled} data rows`);
    console.log('Country distribution in sampled data:');
    Object.entries(countrySampled)
      .sort((a, b) => b[1] - a[1])
      .forEach(([country, count]) => {
        console.log(`  Country ${country}: ${count} responses`);
      });
    
    // Write sampled data
    const sampledData = sampledLines.join('\n');
    fs.writeFileSync(outputFile, sampledData);
    
    // Check final size
    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const finalLines = sampledLines.length;
    
    console.log(`\n✅ Sample file created successfully!`);
    console.log(`📁 File: ${outputFile}`);
    console.log(`📊 Lines: ${finalLines} (target: ${maxLines})`);
    console.log(`💾 Size: ${sizeMB}MB (target: ${maxSizeMB}MB)`);
    
    if (finalLines <= maxLines && parseFloat(sizeMB) <= maxSizeMB) {
      console.log(`🎉 Successfully within limits!`);
    } else {
      console.log(`⚠️  Warning: Exceeds limits`);
    }
    
    return {
      lines: finalLines,
      sizeMB: parseFloat(sizeMB),
      countries: Object.keys(countrySampled).length
    };
    
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2] || 'Pew Religion Sample Data.csv';
  const outputFile = process.argv[3] || 'Pew Religion Sample Data - Small.csv';
  const maxLines = parseInt(process.argv[4]) || 1000;
  const maxSizeMB = parseInt(process.argv[5]) || 10;
  
  try {
    const result = createSampleData(inputFile, outputFile, maxLines, maxSizeMB);
    console.log(`\n📈 Summary:`);
    console.log(`- Countries represented: ${result.countries}`);
    console.log(`- Total responses: ${result.lines - 1}`);
    console.log(`- File size: ${result.sizeMB}MB`);
  } catch (error) {
    console.error('❌ Sampling failed:', error.message);
    process.exit(1);
  }
}

module.exports = { createSampleData };

