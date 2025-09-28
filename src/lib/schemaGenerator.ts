import { DatasetAnalysis, LocationColumn, NumericColumn, CategoricalColumn } from './dataDiscovery';

export interface LocationField {
  column: string;
  type: 'latitude' | 'longitude' | 'address' | 'country';
  required: boolean;
  confidence: number;
}

export interface DataField {
  column: string;
  type: 'numeric' | 'categorical' | 'temporal';
  visualizationType: 'size' | 'color' | 'label' | 'filter';
  range?: { min: number; max: number };
  categories?: string[];
}

export interface GlobeSchema {
  locationFields: LocationField[];
  dataFields: DataField[];
  visualizationOptions: VisualizationOption[];
}

export interface VisualizationOption {
  type: 'size' | 'color' | 'label' | 'filter';
  field: string;
  label: string;
  description: string;
  available: boolean;
}

export class SchemaGenerator {
  /**
   * Create a Globe schema from dataset analysis
   */
  createGlobeSchema(analysis: DatasetAnalysis): GlobeSchema {
    const locationFields = this.mapLocationFields(analysis.locationColumns);
    const dataFields = this.mapDataFields(analysis.numericColumns, analysis.categoricalColumns);
    const visualizationOptions = this.generateVisualizationOptions(analysis);

    return {
      locationFields,
      dataFields,
      visualizationOptions
    };
  }

  /**
   * Map location columns to location fields
   */
  private mapLocationFields(locationColumns: LocationColumn[]): LocationField[] {
    const locationFields: LocationField[] = [];

    locationColumns.forEach(col => {
      let fieldType: 'latitude' | 'longitude' | 'address' | 'country';
      
      switch (col.type) {
        case 'lat_lng':
          fieldType = 'latitude';
          break;
        case 'lng':
          fieldType = 'longitude';
          break;
        case 'address':
          fieldType = 'address';
          break;
        case 'country':
          fieldType = 'country';
          break;
        case 'city':
          fieldType = 'address'; // Treat city as address for now
          break;
        default:
          return; // Skip unknown types
      }

      locationFields.push({
        column: col.name,
        type: fieldType,
        required: col.confidence > 0.8,
        confidence: col.confidence
      });
    });

    return locationFields;
  }

  /**
   * Map numeric and categorical columns to data fields
   */
  private mapDataFields(
    numericColumns: NumericColumn[], 
    categoricalColumns: CategoricalColumn[]
  ): DataField[] {
    const dataFields: DataField[] = [];

    // Map numeric columns
    numericColumns.forEach(col => {
      let visualizationType: 'size' | 'color' | 'label' | 'filter';
      
      // Determine visualization type based on range and distribution
      if (col.range.max > col.range.min * 5) {
        visualizationType = 'size'; // Large range suggests size
      } else if (col.distribution === 'uniform') {
        visualizationType = 'color'; // Uniform distribution suggests color
      } else {
        visualizationType = 'label'; // Default to label
      }

      dataFields.push({
        column: col.name,
        type: 'numeric',
        visualizationType,
        range: col.range
      });
    });

    // Map categorical columns
    categoricalColumns.forEach(col => {
      let visualizationType: 'size' | 'color' | 'label' | 'filter';
      
      if (col.cardinality <= 5) {
        visualizationType = 'color'; // Low cardinality suggests color
      } else if (col.cardinality <= 20) {
        visualizationType = 'filter'; // Medium cardinality suggests filter
      } else {
        visualizationType = 'label'; // High cardinality suggests label
      }

      dataFields.push({
        column: col.name,
        type: 'categorical',
        visualizationType,
        categories: col.uniqueValues
      });
    });

    return dataFields;
  }

  /**
   * Generate visualization options based on available fields
   */
  private generateVisualizationOptions(analysis: DatasetAnalysis): VisualizationOption[] {
    const options: VisualizationOption[] = [];

    // Size options from numeric columns
    const sizeFields = analysis.numericColumns.filter(col => 
      col.range.max > col.range.min * 2
    );
    
    sizeFields.forEach(col => {
      options.push({
        type: 'size',
        field: col.name,
        label: `Size by ${col.name}`,
        description: `Use ${col.name} values to determine marker size (${col.range.min} - ${col.range.max})`,
        available: true
      });
    });

    // Color options from categorical columns
    const colorFields = analysis.categoricalColumns.filter(col => 
      col.cardinality <= 10
    );
    
    colorFields.forEach(col => {
      options.push({
        type: 'color',
        field: col.name,
        label: `Color by ${col.name}`,
        description: `Use ${col.name} categories for color coding (${col.cardinality} unique values)`,
        available: true
      });
    });

    // Label options from all columns
    const labelFields = [
      ...analysis.locationColumns.map(col => col.name),
      ...analysis.categoricalColumns.map(col => col.name)
    ];
    
    labelFields.forEach(field => {
      options.push({
        type: 'label',
        field,
        label: `Label with ${field}`,
        description: `Display ${field} as marker labels`,
        available: true
      });
    });

    // Filter options from categorical columns
    const filterFields = analysis.categoricalColumns.filter(col => 
      col.cardinality > 5 && col.cardinality <= 50
    );
    
    filterFields.forEach(col => {
      options.push({
        type: 'filter',
        field: col.name,
        label: `Filter by ${col.name}`,
        description: `Filter visualization by ${col.name} categories`,
        available: true
      });
    });

    return options;
  }

  /**
   * Validate a mapping configuration
   */
  validateMapping(schema: GlobeSchema, mapping: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required location fields
    const requiredLocationFields = schema.locationFields.filter(field => field.required);
    requiredLocationFields.forEach(field => {
      if (!mapping[field.type] || mapping[field.type] === '') {
        errors.push(`Required field ${field.type} is not mapped`);
      }
    });

    // Check for valid field mappings
    Object.entries(mapping).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        const fieldExists = schema.dataFields.some(field => field.column === value);
        if (!fieldExists && !schema.locationFields.some(field => field.column === value)) {
          errors.push(`Field ${value} does not exist in dataset`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate default mapping based on analysis
   */
  generateDefaultMapping(analysis: DatasetAnalysis): any {
    const mapping: any = {
      latitude: null,
      longitude: null,
      address: null,
      size: null,
      color: null,
      label: null,
      category: null,
      filters: [],
      aggregations: []
    };

    // Auto-map location fields
    analysis.locationColumns.forEach(col => {
      if (col.type === 'lat_lng' && col.confidence > 0.8) {
        mapping.latitude = col.name;
      } else if (col.type === 'lng' && col.confidence > 0.8) {
        mapping.longitude = col.name;
      } else if (col.type === 'address' && col.confidence > 0.7) {
        mapping.address = col.name;
      }
    });

    // Auto-map visualization fields
    const bestSizeField = analysis.numericColumns
      .filter(col => col.range.max > col.range.min * 2)
      .sort((a, b) => b.range.max - a.range.max)[0];
    
    if (bestSizeField) {
      mapping.size = bestSizeField.name;
    }

    const bestColorField = analysis.categoricalColumns
      .filter(col => col.cardinality <= 10)
      .sort((a, b) => a.cardinality - b.cardinality)[0];
    
    if (bestColorField) {
      mapping.color = bestColorField.name;
    }

    const bestLabelField = analysis.locationColumns
      .filter(col => col.type === 'address' || col.type === 'city')
      .sort((a, b) => b.confidence - a.confidence)[0];
    
    if (bestLabelField) {
      mapping.label = bestLabelField.name;
    }

    return mapping;
  }
}

export const schemaGenerator = new SchemaGenerator();
