import { Location } from './supabase';

// Data analysis interfaces
export interface LocationColumn {
  name: string;
  type: 'lat_lng' | 'lng' | 'address' | 'country' | 'city';
  confidence: number;
  sampleValues: string[];
}

export interface NumericColumn {
  name: string;
  type: 'integer' | 'float' | 'percentage';
  range: { min: number; max: number };
  distribution: 'normal' | 'skewed' | 'uniform';
  sampleValues: number[];
}

export interface CategoricalColumn {
  name: string;
  type: 'string' | 'enum' | 'boolean';
  uniqueValues: string[];
  cardinality: number;
  sampleValues: string[];
}

export interface DatasetAnalysis {
  locationColumns: LocationColumn[];
  numericColumns: NumericColumn[];
  categoricalColumns: CategoricalColumn[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  suggestions: MappingSuggestion[];
}

export interface MappingSuggestion {
  field: string;
  suggestedMapping: 'latitude' | 'longitude' | 'address' | 'size' | 'color' | 'label' | 'category';
  confidence: number;
  reasoning: string;
}

export class DataAnalyzer {
  /**
   * Analyze a dataset and detect column types
   */
  analyzeDataset(data: any[]): DatasetAnalysis {
    if (!data || data.length === 0) {
      return {
        locationColumns: [],
        numericColumns: [],
        categoricalColumns: [],
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        suggestions: []
      };
    }

    const headers = Object.keys(data[0]);
    const locationColumns = this.detectLocationColumns(data, headers);
    const numericColumns = this.detectNumericColumns(data, headers);
    const categoricalColumns = this.detectCategoricalColumns(data, headers);
    const suggestions = this.generateMappingSuggestions(locationColumns, numericColumns, categoricalColumns);

    return {
      locationColumns,
      numericColumns,
      categoricalColumns,
      totalRows: data.length,
      validRows: data.length, // Will be refined with validation
      invalidRows: 0,
      suggestions
    };
  }

  /**
   * Detect location-related columns
   */
  private detectLocationColumns(data: any[], headers: string[]): LocationColumn[] {
    const locationColumns: LocationColumn[] = [];
    
    headers.forEach(header => {
      const values = data.slice(0, 100).map(row => row[header]).filter(v => v !== null && v !== undefined);
      
      // Check for latitude/longitude patterns
      const latPattern = this.detectLatitudePattern(values);
      if (latPattern.confidence > 0.8) {
        locationColumns.push({
          name: header,
          type: 'lat_lng',
          confidence: latPattern.confidence,
          sampleValues: values.slice(0, 5).map(String)
        });
      }

      // Check for longitude patterns
      const lngPattern = this.detectLongitudePattern(values);
      if (lngPattern.confidence > 0.8) {
        locationColumns.push({
          name: header,
          type: 'lng',
          confidence: lngPattern.confidence,
          sampleValues: values.slice(0, 5).map(String)
        });
      }

      // Check for address patterns
      const addressPattern = this.detectAddressPattern(values);
      if (addressPattern.confidence > 0.7) {
        locationColumns.push({
          name: header,
          type: 'address',
          confidence: addressPattern.confidence,
          sampleValues: values.slice(0, 5).map(String)
        });
      }

      // Check for country patterns
      const countryPattern = this.detectCountryPattern(values);
      if (countryPattern.confidence > 0.6) {
        locationColumns.push({
          name: header,
          type: 'country',
          confidence: countryPattern.confidence,
          sampleValues: values.slice(0, 5).map(String)
        });
      }

      // Check for city patterns
      const cityPattern = this.detectCityPattern(values);
      if (cityPattern.confidence > 0.6) {
        locationColumns.push({
          name: header,
          type: 'city',
          confidence: cityPattern.confidence,
          sampleValues: values.slice(0, 5).map(String)
        });
      }
    });

    return locationColumns;
  }

  /**
   * Detect numeric columns
   */
  private detectNumericColumns(data: any[], headers: string[]): NumericColumn[] {
    const numericColumns: NumericColumn[] = [];
    
    headers.forEach(header => {
      const values = data.slice(0, 100).map(row => row[header]).filter(v => v !== null && v !== undefined);
      const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
      
      if (numericValues.length / values.length > 0.8) { // 80% numeric
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const distribution = this.analyzeDistribution(numericValues);
        
        numericColumns.push({
          name: header,
          type: this.detectNumericType(numericValues),
          range: { min, max },
          distribution,
          sampleValues: numericValues.slice(0, 5)
        });
      }
    });

    return numericColumns;
  }

  /**
   * Detect categorical columns
   */
  private detectCategoricalColumns(data: any[], headers: string[]): CategoricalColumn[] {
    const categoricalColumns: CategoricalColumn[] = [];
    
    headers.forEach(header => {
      const values = data.slice(0, 100).map(row => row[header]).filter(v => v !== null && v !== undefined);
      const uniqueValues = Array.from(new Set(values.map(String)));
      const cardinality = uniqueValues.length;
      
      // Categorical if low cardinality relative to data size
      if (cardinality < values.length * 0.1 && cardinality > 1) {
        categoricalColumns.push({
          name: header,
          type: this.detectCategoricalType(values),
          uniqueValues: uniqueValues.slice(0, 10),
          cardinality,
          sampleValues: values.slice(0, 5).map(String)
        });
      }
    });

    return categoricalColumns;
  }

  /**
   * Generate mapping suggestions
   */
  private generateMappingSuggestions(
    locationColumns: LocationColumn[],
    numericColumns: NumericColumn[],
    categoricalColumns: CategoricalColumn[]
  ): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];

    // Location mapping suggestions
    locationColumns.forEach(col => {
      if (col.type === 'lat_lng') {
        suggestions.push({
          field: col.name,
          suggestedMapping: 'latitude',
          confidence: col.confidence,
          reasoning: `Detected as latitude column with ${(col.confidence * 100).toFixed(1)}% confidence`
        });
      } else if (col.type === 'lng') {
        suggestions.push({
          field: col.name,
          suggestedMapping: 'longitude',
          confidence: col.confidence,
          reasoning: `Detected as longitude column with ${(col.confidence * 100).toFixed(1)}% confidence`
        });
      } else if (col.type === 'address') {
        suggestions.push({
          field: col.name,
          suggestedMapping: 'address',
          confidence: col.confidence,
          reasoning: `Detected as address column with ${(col.confidence * 100).toFixed(1)}% confidence`
        });
      }
    });

    // Numeric mapping suggestions
    numericColumns.forEach(col => {
      if (col.range.max > col.range.min * 10) { // Large range suggests size mapping
        suggestions.push({
          field: col.name,
          suggestedMapping: 'size',
          confidence: 0.8,
          reasoning: `Large numeric range (${col.range.min} to ${col.range.max}) suggests size visualization`
        });
      }
    });

    // Categorical mapping suggestions
    categoricalColumns.forEach(col => {
      if (col.cardinality <= 10) { // Low cardinality suggests color mapping
        suggestions.push({
          field: col.name,
          suggestedMapping: 'color',
          confidence: 0.7,
          reasoning: `Low cardinality (${col.cardinality} unique values) suggests color mapping`
        });
      } else {
        suggestions.push({
          field: col.name,
          suggestedMapping: 'label',
          confidence: 0.6,
          reasoning: `High cardinality (${col.cardinality} unique values) suggests label mapping`
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Pattern detection methods
  private detectLatitudePattern(values: any[]): { confidence: number } {
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (numericValues.length === 0) return { confidence: 0 };
    
    const latRange = numericValues.filter(v => v >= -90 && v <= 90);
    const confidence = latRange.length / numericValues.length;
    
    return { confidence };
  }

  private detectLongitudePattern(values: any[]): { confidence: number } {
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (numericValues.length === 0) return { confidence: 0 };
    
    const lngRange = numericValues.filter(v => v >= -180 && v <= 180);
    const confidence = lngRange.length / numericValues.length;
    
    return { confidence };
  }

  private detectAddressPattern(values: any[]): { confidence: number } {
    const stringValues = values.map(String);
    const addressKeywords = ['street', 'avenue', 'road', 'drive', 'lane', 'boulevard', 'way'];
    const hasAddressKeywords = stringValues.some(v => 
      addressKeywords.some(keyword => v.toLowerCase().includes(keyword))
    );
    
    const hasNumbers = stringValues.some(v => /\d/.test(v));
    const confidence = (hasAddressKeywords ? 0.4 : 0) + (hasNumbers ? 0.3 : 0) + 0.3;
    
    return { confidence };
  }

  private detectCountryPattern(values: any[]): { confidence: number } {
    const stringValues = values.map(String);
    const countryKeywords = ['usa', 'united states', 'canada', 'mexico', 'france', 'germany', 'uk', 'australia'];
    const hasCountryKeywords = stringValues.some(v => 
      countryKeywords.some(keyword => v.toLowerCase().includes(keyword))
    );
    
    const confidence = hasCountryKeywords ? 0.8 : 0.3;
    return { confidence };
  }

  private detectCityPattern(values: any[]): { confidence: number } {
    const stringValues = values.map(String);
    const cityKeywords = ['city', 'town', 'village', 'municipality'];
    const hasCityKeywords = stringValues.some(v => 
      cityKeywords.some(keyword => v.toLowerCase().includes(keyword))
    );
    
    const confidence = hasCityKeywords ? 0.7 : 0.4;
    return { confidence };
  }

  private detectNumericType(values: number[]): 'integer' | 'float' | 'percentage' {
    const hasDecimals = values.some(v => v % 1 !== 0);
    const maxValue = Math.max(...values);
    
    if (maxValue <= 1 && values.every(v => v >= 0 && v <= 1)) {
      return 'percentage';
    }
    
    return hasDecimals ? 'float' : 'integer';
  }

  private detectCategoricalType(values: any[]): 'string' | 'enum' | 'boolean' {
    const uniqueValues = Array.from(new Set(values.map(String)));
    
    if (uniqueValues.length === 2) {
      return 'boolean';
    }
    
    if (uniqueValues.length <= 10) {
      return 'enum';
    }
    
    return 'string';
  }

  private analyzeDistribution(values: number[]): 'normal' | 'skewed' | 'uniform' {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Simple distribution analysis
    const withinOneStdDev = values.filter(v => Math.abs(v - mean) <= stdDev).length;
    const ratio = withinOneStdDev / values.length;
    
    if (ratio > 0.6) return 'normal';
    if (ratio < 0.4) return 'skewed';
    return 'uniform';
  }
}

export const dataAnalyzer = new DataAnalyzer();
