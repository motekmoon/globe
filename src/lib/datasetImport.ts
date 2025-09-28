import { Location } from './supabase';

export interface DatasetImportResult {
  success: boolean;
  imported: Location[];
  errors: string[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface ImportOptions {
  skipInvalidRows: boolean;
  validateCoordinates: boolean;
  duplicateHandling: 'skip' | 'replace' | 'allow';
}

export class DatasetImporter {
  private options: ImportOptions;

  constructor(options: Partial<ImportOptions> = {}) {
    this.options = {
      skipInvalidRows: true,
      validateCoordinates: true,
      duplicateHandling: 'skip',
      ...options
    };
  }

  /**
   * Import locations from CSV data
   */
  async importFromCSV(csvData: string): Promise<DatasetImportResult> {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = this.parseCSVLine(lines[0]);
    const dataLines = lines.slice(1);

    const result: DatasetImportResult = {
      success: true,
      imported: [],
      errors: [],
      totalRows: dataLines.length,
      validRows: 0,
      invalidRows: 0
    };

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const row = this.parseCSVLine(dataLines[i]);
        const location = this.parseLocationFromRow(row, headers, i + 2); // +2 for header and 0-index
        
        if (location) {
          result.imported.push(location);
          result.validRows++;
        } else {
          result.invalidRows++;
          if (!this.options.skipInvalidRows) {
            result.errors.push(`Row ${i + 2}: Invalid location data`);
          }
        }
      } catch (error) {
        result.invalidRows++;
        result.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.success = result.errors.length === 0 || this.options.skipInvalidRows;
    return result;
  }

  /**
   * Import locations from JSON data
   */
  async importFromJSON(jsonData: string): Promise<DatasetImportResult> {
    const result: DatasetImportResult = {
      success: true,
      imported: [],
      errors: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0
    };

    try {
      const data = JSON.parse(jsonData);
      const locations = Array.isArray(data) ? data : data.locations || data.data || [];

      result.totalRows = locations.length;

      for (let i = 0; i < locations.length; i++) {
        try {
          const location = this.parseLocationFromObject(locations[i], i + 1);
          
          if (location) {
            result.imported.push(location);
            result.validRows++;
          } else {
            result.invalidRows++;
            if (!this.options.skipInvalidRows) {
              result.errors.push(`Item ${i + 1}: Invalid location data`);
            }
          }
        } catch (error) {
          result.invalidRows++;
          result.errors.push(`Item ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      result.success = result.errors.length === 0 || this.options.skipInvalidRows;
    } catch (error) {
      result.success = false;
      result.errors.push(`JSON Parse Error: ${error instanceof Error ? error.message : 'Invalid JSON format'}`);
    }

    return result;
  }

  /**
   * Import locations from file
   */
  async importFromFile(file: File): Promise<DatasetImportResult> {
    const text = await this.readFileAsText(file);
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      return this.importFromCSV(text);
    } else if (file.name.toLowerCase().endsWith('.json')) {
      return this.importFromJSON(text);
    } else {
      return {
        success: false,
        imported: [],
        errors: ['Unsupported file format. Please use CSV or JSON files.'],
        totalRows: 0,
        validRows: 0,
        invalidRows: 0
      };
    }
  }

  /**
   * Parse CSV line handling quoted values
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
   * Parse location from CSV row
   */
  private parseLocationFromRow(row: string[], headers: string[], rowNumber: number): Location | null {
    const location: Partial<Location> = {};
    
    // Map common column names
    const columnMap: { [key: string]: string } = {
      'name': 'name',
      'title': 'name',
      'location': 'name',
      'address': 'name',
      'lat': 'latitude',
      'lng': 'longitude',
      'lon': 'longitude',
      'long': 'longitude',
      'latitude': 'latitude',
      'longitude': 'longitude',
      'quantity': 'quantity',
      'qty': 'quantity',
      'value': 'quantity',
      'size': 'quantity',
      'amount': 'quantity'
    };

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase().trim();
      const value = row[i]?.trim();
      
      if (value && columnMap[header]) {
        const field = columnMap[header];
        
        if (field === 'latitude' || field === 'longitude' || field === 'quantity') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            location[field] = numValue;
          }
        } else {
          (location as any)[field] = value;
        }
      }
    }

    // Validate required fields
    if (!location.name || location.latitude === undefined || location.longitude === undefined) {
      return null;
    }

    // Validate coordinates
    if (this.options.validateCoordinates) {
      if (location.latitude < -90 || location.latitude > 90) {
        throw new Error(`Invalid latitude: ${location.latitude}. Must be between -90 and 90.`);
      }
      if (location.longitude < -180 || location.longitude > 180) {
        throw new Error(`Invalid longitude: ${location.longitude}. Must be between -180 and 180.`);
      }
    }

    return {
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      quantity: location.quantity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Parse location from JSON object
   */
  private parseLocationFromObject(obj: any, index: number): Location | null {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    const name = obj.name || obj.title || obj.location || obj.address;
    const latitude = parseFloat(obj.latitude || obj.lat);
    const longitude = parseFloat(obj.longitude || obj.lng || obj.lon || obj.long);
    const quantity = parseFloat(obj.quantity || obj.qty || obj.value || obj.size || obj.amount);

    if (!name || isNaN(latitude) || isNaN(longitude)) {
      return null;
    }

    // Validate coordinates
    if (this.options.validateCoordinates) {
      if (latitude < -90 || latitude > 90) {
        throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
      }
      if (longitude < -180 || longitude > 180) {
        throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
      }
    }

    return {
      id: obj.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      latitude: latitude,
      longitude: longitude,
      quantity: isNaN(quantity) ? undefined : quantity,
      created_at: obj.created_at || new Date().toISOString(),
      updated_at: obj.updated_at || new Date().toISOString()
    };
  }

  /**
   * Read file as text
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  /**
   * Generate sample CSV template
   */
  generateCSVTemplate(): string {
    return `name,latitude,longitude,quantity
"New York City",40.7128,-74.0060,15.2
"London",51.5074,-0.1278,12.8
"Tokyo",35.6762,139.6503,18.5
"Paris",48.8566,2.3522,10.3
"Sydney",-33.8688,151.2093,8.7`;
  }

  /**
   * Generate sample JSON template
   */
  generateJSONTemplate(): string {
    return JSON.stringify([
      {
        "name": "New York City",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "quantity": 15.2
      },
      {
        "name": "London", 
        "latitude": 51.5074,
        "longitude": -0.1278,
        "quantity": 12.8
      },
      {
        "name": "Tokyo",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "quantity": 18.5
      }
    ], null, 2);
  }
}

export const datasetImporter = new DatasetImporter();
