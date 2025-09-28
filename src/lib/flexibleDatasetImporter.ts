import { Location } from './supabase';

export interface FlexibleImportResult {
  success: boolean;
  rawData: any[]; // Raw data for dynamic visualization
  parsedLocations: Location[]; // Parsed locations for direct import
  errors: string[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  columnAnalysis: {
    headers: string[];
    sampleData: any[];
    detectedTypes: { [key: string]: string };
  };
}

export interface FlexibleImportOptions {
  skipInvalidRows: boolean;
  validateCoordinates: boolean;
  duplicateHandling: 'skip' | 'replace' | 'allow';
  autoDetectSchema: boolean;
}

export class FlexibleDatasetImporter {
  private options: FlexibleImportOptions;

  constructor(options: Partial<FlexibleImportOptions> = {}) {
    this.options = {
      skipInvalidRows: true,
      validateCoordinates: true,
      duplicateHandling: 'skip',
      autoDetectSchema: true,
      ...options
    };
  }

  /**
   * Import data with flexible schema detection
   */
  async importFromFile(file: File): Promise<FlexibleImportResult> {
    console.log('FlexibleDatasetImporter: Starting import for file:', file.name);
    
    // Check file size to prevent memory issues
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
    }

    console.log('FlexibleDatasetImporter: Reading file content...');
    const fileContent = await this.readFileContent(file);
    console.log('FlexibleDatasetImporter: File content length:', fileContent.length);
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    console.log('FlexibleDatasetImporter: File extension:', fileExtension);

    let rawData: any[] = [];
    
    try {
      if (fileExtension === 'csv') {
        console.log('FlexibleDatasetImporter: Parsing CSV...');
        rawData = this.parseCSV(fileContent);
        console.log('FlexibleDatasetImporter: CSV parsed, rows:', rawData.length);
      } else if (fileExtension === 'json') {
        console.log('FlexibleDatasetImporter: Parsing JSON...');
        rawData = this.parseJSON(fileContent);
        console.log('FlexibleDatasetImporter: JSON parsed, rows:', rawData.length);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON.');
      }

      // Limit data size to prevent performance issues
      const maxRows = 1000; // Limit to 1000 rows for performance
      if (rawData.length > maxRows) {
        rawData = rawData.slice(0, maxRows);
        console.warn(`Data limited to first ${maxRows} rows for performance.`);
      }

      console.log('FlexibleDatasetImporter: Processing flexible data...');
      const result = this.processFlexibleData(rawData);
      console.log('FlexibleDatasetImporter: Processing complete:', result);
      return result;
    } catch (error) {
      console.error('FlexibleDatasetImporter: Import error:', error);
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process data with flexible schema detection
   */
  private processFlexibleData(rawData: any[]): FlexibleImportResult {
    if (rawData.length === 0) {
      return {
        success: false,
        rawData: [],
        parsedLocations: [],
        errors: ['No data found in file'],
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        columnAnalysis: {
          headers: [],
          sampleData: [],
          detectedTypes: {}
        }
      };
    }

    try {
      const headers = Object.keys(rawData[0]);
      console.log('FlexibleDatasetImporter: Headers detected:', headers);
      const sampleData = rawData.slice(0, 5);
      console.log('FlexibleDatasetImporter: Sample data:', sampleData);
      
      const detectedTypes = this.detectColumnTypes(rawData, headers);
      console.log('FlexibleDatasetImporter: Detected types:', detectedTypes);
      
      // Try to parse locations with flexible schema
      const { parsedLocations, errors } = this.parseLocationsFlexibly(rawData, detectedTypes);
      console.log('FlexibleDatasetImporter: Parsed locations:', parsedLocations.length, 'Errors:', errors.length);
      
      const validRows = parsedLocations.length;
      const invalidRows = rawData.length - validRows;

      const result = {
        success: validRows > 0,
        rawData,
        parsedLocations,
        errors,
        totalRows: rawData.length,
        validRows,
        invalidRows,
        columnAnalysis: {
          headers,
          sampleData,
          detectedTypes
        }
      };
      
      console.log('FlexibleDatasetImporter: Final result:', result);
      return result;
    } catch (error) {
      console.error('Data processing error:', error);
      return {
        success: false,
        rawData: [],
        parsedLocations: [],
        errors: [`Data processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        totalRows: rawData.length,
        validRows: 0,
        invalidRows: rawData.length,
        columnAnalysis: {
          headers: rawData.length > 0 ? Object.keys(rawData[0]) : [],
          sampleData: rawData.slice(0, 3),
          detectedTypes: {}
        }
      };
    }
  }

  /**
   * Detect column types automatically
   */
  private detectColumnTypes(data: any[], headers: string[]): { [key: string]: string } {
    const types: { [key: string]: string } = {};
    
    // Limit data processing to prevent performance issues
    const maxRows = Math.min(data.length, 50); // Reduced from 100 to 50
    const sampleData = data.slice(0, maxRows);

    headers.forEach(header => {
      const values = sampleData.map(row => row[header]).filter(v => v !== null && v !== undefined);
      
      if (values.length === 0) {
        types[header] = 'unknown';
        return;
      }

      // Check for latitude
      if (this.isLatitudeColumn(values)) {
        types[header] = 'latitude';
        return;
      }

      // Check for longitude
      if (this.isLongitudeColumn(values)) {
        types[header] = 'longitude';
        return;
      }

      // Check for numeric
      if (this.isNumericColumn(values)) {
        types[header] = 'numeric';
        return;
      }

      // Check for text/name
      if (this.isTextColumn(values)) {
        types[header] = 'text';
        return;
      }

      types[header] = 'unknown';
    });

    return types;
  }

  /**
   * Parse locations with flexible schema
   */
  private parseLocationsFlexibly(data: any[], detectedTypes: { [key: string]: string }): {
    parsedLocations: Location[];
    errors: string[];
  } {
    const parsedLocations: Location[] = [];
    const errors: string[] = [];

    // Find latitude and longitude columns
    const latColumn = Object.keys(detectedTypes).find(key => detectedTypes[key] === 'latitude');
    const lngColumn = Object.keys(detectedTypes).find(key => detectedTypes[key] === 'longitude');
    
    // Find name column (text type or any column with 'name' in it)
    const nameColumn = Object.keys(detectedTypes).find(key => 
      detectedTypes[key] === 'text' || 
      key.toLowerCase().includes('name') ||
      key.toLowerCase().includes('location') ||
      key.toLowerCase().includes('city')
    );

    // Find quantity column (numeric type)
    const quantityColumn = Object.keys(detectedTypes).find(key => 
      detectedTypes[key] === 'numeric' && 
      !key.toLowerCase().includes('lat') && 
      !key.toLowerCase().includes('lng')
    );

    if (!latColumn || !lngColumn) {
      errors.push('Could not detect latitude and longitude columns. Please ensure your data has coordinate columns.');
      return { parsedLocations, errors };
    }

    data.forEach((row, index) => {
      try {
        const lat = parseFloat(row[latColumn]);
        const lng = parseFloat(row[lngColumn]);
        
        if (isNaN(lat) || isNaN(lng)) {
          errors.push(`Row ${index + 1}: Invalid coordinates`);
          return;
        }

        if (lat < -90 || lat > 90) {
          errors.push(`Row ${index + 1}: Latitude out of range (-90 to 90)`);
          return;
        }

        if (lng < -180 || lng > 180) {
          errors.push(`Row ${index + 1}: Longitude out of range (-180 to 180)`);
          return;
        }

        const name = nameColumn ? String(row[nameColumn]) : `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        const quantity = quantityColumn ? parseFloat(row[quantityColumn]) : undefined;

        parsedLocations.push({
          id: `imported-${Date.now()}-${index}`,
          name,
          latitude: lat,
          longitude: lng,
          quantity: isNaN(quantity || 0) ? undefined : quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return { parsedLocations, errors };
  }

  /**
   * Check if column contains latitude values
   */
  private isLatitudeColumn(values: any[]): boolean {
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (numericValues.length === 0) return false;
    
    const latRange = numericValues.filter(v => v >= -90 && v <= 90);
    return latRange.length / numericValues.length > 0.8; // 80% within latitude range
  }

  /**
   * Check if column contains longitude values
   */
  private isLongitudeColumn(values: any[]): boolean {
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (numericValues.length === 0) return false;
    
    const lngRange = numericValues.filter(v => v >= -180 && v <= 180);
    return lngRange.length / numericValues.length > 0.8; // 80% within longitude range
  }

  /**
   * Check if column contains numeric values
   */
  private isNumericColumn(values: any[]): boolean {
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    return numericValues.length / values.length > 0.8; // 80% numeric
  }

  /**
   * Check if column contains text values
   */
  private isTextColumn(values: any[]): boolean {
    const stringValues = values.map(String);
    const hasText = stringValues.some(v => v.length > 0 && isNaN(parseFloat(v)));
    return hasText && stringValues.length / values.length > 0.5; // 50% text
  }

  /**
   * Parse CSV content
   */
  private parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]);
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return data;
  }

  /**
   * Parse JSON content
   */
  private parseJSON(content: string): any[] {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Parse CSV line handling quotes and commas
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Read file content
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }

  /**
   * Generate flexible CSV template
   */
  generateFlexibleCSVTemplate(): string {
    return `name,latitude,longitude,value
"New York City",40.7128,-74.0060,15.2
"London",51.5074,-0.1278,12.8
"Tokyo",35.6762,139.6503,18.5
"Paris",48.8566,2.3522,10.3
"Sydney",-33.8688,151.2093,8.7`;
  }

  /**
   * Generate flexible JSON template
   */
  generateFlexibleJSONTemplate(): string {
    return JSON.stringify([
      {
        "name": "New York City",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "value": 15.2
      },
      {
        "name": "London", 
        "latitude": 51.5074,
        "longitude": -0.1278,
        "value": 12.8
      },
      {
        "name": "Tokyo",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "value": 18.5
      }
    ], null, 2);
  }
}

export const flexibleDatasetImporter = new FlexibleDatasetImporter();
