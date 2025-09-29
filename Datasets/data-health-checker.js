#!/usr/bin/env node

/**
 * Data Health Checker for Globe Test Dataset
 * Validates data types, formats, and syntax errors
 */

const fs = require('fs');
const path = require('path');

function performHealthCheck(inputFile) {
  try {
    console.log('🔍 Globe Test Dataset Health Check');
    console.log('=================================');
    console.log(`File: ${inputFile}`);
    console.log('');
    
    // Read the file
    const data = fs.readFileSync(inputFile, 'utf8');
    const lines = data.split('\n').filter(line => line.trim());
    
    console.log(`📊 Total lines: ${lines.length}`);
    console.log(`📋 Data rows: ${lines.length - 1}`);
    console.log('');
    
    // Parse header
    const header = lines[0].split(',');
    console.log('📋 Column headers:');
    header.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col}`);
    });
    console.log('');
    
    // Expected data types
    const expectedTypes = {
      'country_name': 'string',
      'latitude': 'number',
      'longitude': 'number', 
      'population': 'integer',
      'temperature': 'number',
      'is_capital': 'boolean',
      'founded_year': 'integer',
      'continent': 'string',
      'gdp_per_capita': 'number',
      'last_updated': 'date'
    };
    
    // Validation results
    const validationResults = {
      totalRows: lines.length - 1,
      validRows: 0,
      invalidRows: 0,
      errors: [],
      warnings: []
    };
    
    // Check each data row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const rowNum = i;
      const columns = line.split(',');
      
      if (columns.length !== header.length) {
        validationResults.errors.push(`Row ${rowNum}: Column count mismatch (expected ${header.length}, got ${columns.length})`);
        validationResults.invalidRows++;
        continue;
      }
      
      let rowValid = true;
      const rowErrors = [];
      
      // Validate each column
      for (let j = 0; j < columns.length; j++) {
        const columnName = header[j];
        const value = columns[j];
        const expectedType = expectedTypes[columnName];
        
        // Remove quotes for validation
        const cleanValue = value.replace(/"/g, '');
        
        switch (expectedType) {
          case 'string':
            if (!value.startsWith('"') || !value.endsWith('"')) {
              rowErrors.push(`Column ${columnName}: String not properly quoted`);
              rowValid = false;
            }
            break;
            
          case 'number':
            if (isNaN(parseFloat(cleanValue))) {
              rowErrors.push(`Column ${columnName}: Not a valid number (${cleanValue})`);
              rowValid = false;
            }
            break;
            
          case 'integer':
            if (!Number.isInteger(parseFloat(cleanValue))) {
              rowErrors.push(`Column ${columnName}: Not a valid integer (${cleanValue})`);
              rowValid = false;
            }
            break;
            
          case 'boolean':
            if (cleanValue !== 'true' && cleanValue !== 'false') {
              rowErrors.push(`Column ${columnName}: Not a valid boolean (${cleanValue})`);
              rowValid = false;
            }
            break;
            
          case 'date':
            if (!value.startsWith('"') || !value.endsWith('"')) {
              rowErrors.push(`Column ${columnName}: Date not properly quoted`);
              rowValid = false;
            } else {
              const dateStr = cleanValue;
              const date = new Date(dateStr);
              if (isNaN(date.getTime())) {
                rowErrors.push(`Column ${columnName}: Not a valid date (${dateStr})`);
                rowValid = false;
              }
            }
            break;
        }
        
        // Specific validations
        if (columnName === 'latitude') {
          const lat = parseFloat(cleanValue);
          if (lat < -90 || lat > 90) {
            rowErrors.push(`Column ${columnName}: Latitude out of range (${lat})`);
            rowValid = false;
          }
        }
        
        if (columnName === 'longitude') {
          const lng = parseFloat(cleanValue);
          if (lng < -180 || lng > 180) {
            rowErrors.push(`Column ${columnName}: Longitude out of range (${lng})`);
            rowValid = false;
          }
        }
        
        if (columnName === 'population') {
          const pop = parseInt(cleanValue);
          if (pop < 0) {
            rowErrors.push(`Column ${columnName}: Population cannot be negative (${pop})`);
            rowValid = false;
          }
        }
        
        if (columnName === 'founded_year') {
          const year = parseInt(cleanValue);
          if (year < 1800 || year > 2024) {
            rowErrors.push(`Column ${columnName}: Founded year out of reasonable range (${year})`);
            rowValid = false;
          }
        }
      }
      
      if (rowValid) {
        validationResults.validRows++;
      } else {
        validationResults.invalidRows++;
        validationResults.errors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
      }
    }
    
    // Generate report
    console.log('📊 VALIDATION RESULTS');
    console.log('====================');
    console.log(`✅ Valid rows: ${validationResults.validRows}`);
    console.log(`❌ Invalid rows: ${validationResults.invalidRows}`);
    console.log(`📈 Success rate: ${((validationResults.validRows / validationResults.totalRows) * 100).toFixed(1)}%`);
    console.log('');
    
    if (validationResults.errors.length > 0) {
      console.log('❌ ERRORS FOUND:');
      validationResults.errors.slice(0, 10).forEach(error => {
        console.log(`  • ${error}`);
      });
      if (validationResults.errors.length > 10) {
        console.log(`  ... and ${validationResults.errors.length - 10} more errors`);
      }
      console.log('');
    }
    
    // Data type distribution analysis
    console.log('📊 DATA TYPE ANALYSIS');
    console.log('=====================');
    
    const typeCounts = {};
    const sampleValues = {};
    
    for (let i = 1; i < Math.min(6, lines.length); i++) {
      const columns = lines[i].split(',');
      for (let j = 0; j < columns.length; j++) {
        const columnName = header[j];
        const value = columns[j];
        
        if (!typeCounts[columnName]) {
          typeCounts[columnName] = 0;
          sampleValues[columnName] = [];
        }
        
        typeCounts[columnName]++;
        if (sampleValues[columnName].length < 3) {
          sampleValues[columnName].push(value);
        }
      }
    }
    
    Object.keys(expectedTypes).forEach(columnName => {
      const expectedType = expectedTypes[columnName];
      const samples = sampleValues[columnName] || [];
      console.log(`${columnName}:`);
      console.log(`  Expected: ${expectedType}`);
      console.log(`  Samples: ${samples.join(', ')}`);
    });
    
    console.log('');
    
    // File integrity check
    console.log('🔍 FILE INTEGRITY CHECK');
    console.log('=======================');
    
    // Check for common CSV issues
    const hasQuotes = data.includes('"');
    const hasCommas = data.includes(',');
    const hasNewlines = data.includes('\n');
    const hasCarriageReturns = data.includes('\r');
    
    console.log(`✅ Contains quotes: ${hasQuotes ? 'Yes' : 'No'}`);
    console.log(`✅ Contains commas: ${hasCommas ? 'Yes' : 'No'}`);
    console.log(`✅ Contains newlines: ${hasNewlines ? 'Yes' : 'No'}`);
    console.log(`⚠️  Contains carriage returns: ${hasCarriageReturns ? 'Yes' : 'No'}`);
    
    // Check for malformed CSV
    const malformedLines = lines.filter(line => {
      const quoteCount = (line.match(/"/g) || []).length;
      return quoteCount % 2 !== 0;
    });
    
    if (malformedLines.length > 0) {
      console.log(`❌ Malformed CSV lines: ${malformedLines.length}`);
      validationResults.warnings.push(`${malformedLines.length} lines have unmatched quotes`);
    } else {
      console.log(`✅ CSV format: Valid`);
    }
    
    console.log('');
    
    // Final assessment
    console.log('🎯 FINAL ASSESSMENT');
    console.log('===================');
    
    if (validationResults.invalidRows === 0) {
      console.log('🎉 EXCELLENT: All data is correctly formatted!');
      console.log('✅ No syntax errors found');
      console.log('✅ All data types are valid');
      console.log('✅ All values are within expected ranges');
    } else if (validationResults.invalidRows < validationResults.totalRows * 0.1) {
      console.log('⚠️  GOOD: Minor issues found');
      console.log(`✅ ${validationResults.validRows} rows are valid`);
      console.log(`❌ ${validationResults.invalidRows} rows need attention`);
    } else {
      console.log('❌ NEEDS ATTENTION: Multiple issues found');
      console.log(`❌ ${validationResults.invalidRows} rows have errors`);
    }
    
    return validationResults;
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2] || 'Globe Test Dataset.csv';
  
  try {
    const results = performHealthCheck(inputFile);
    console.log(`\n📊 Health check completed!`);
    console.log(`📈 Overall health: ${results.validRows}/${results.totalRows} rows valid`);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

module.exports = { performHealthCheck };

