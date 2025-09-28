# Dynamic Data Mapping & Visualization System Proposal

## 🎯 **Project Overview**

Transform Globe from a static location viewer into a **dynamic data visualization platform** that can analyze imported datasets, auto-generate database schemas, and let users create interactive visualizations on the 3D globe.

## 🧠 **Core Concept**

### **Current State**
- Static location viewer with manual location entry
- Fixed data structure (name, latitude, longitude)
- Limited visualization options

### **Proposed State**
- Dynamic dataset analysis and mapping
- Auto-detection of geographic and data columns
- Interactive column mapping interface
- Multiple visualization modes
- Real-time preview and adjustments

## 🔍 **Technical Architecture**

### **1. Data Discovery Engine**

```typescript
interface DataDiscovery {
  detectLocationColumns(dataset: any[]): LocationColumn[]
  detectNumericColumns(dataset: any[]): NumericColumn[]
  detectCategoricalColumns(dataset: any[]): CategoricalColumn[]
  suggestMappings(columns: Column[]): MappingSuggestion[]
}

interface LocationColumn {
  name: string
  type: 'lat_lng' | 'address' | 'country' | 'city'
  confidence: number
  sampleValues: string[]
}

interface NumericColumn {
  name: string
  type: 'integer' | 'float' | 'percentage'
  range: { min: number, max: number }
  distribution: 'normal' | 'skewed' | 'uniform'
}

interface CategoricalColumn {
  name: string
  type: 'string' | 'enum' | 'boolean'
  uniqueValues: string[]
  cardinality: number
}
```

### **2. Dynamic Schema Generation**

```typescript
interface GlobeDataset {
  id: string
  name: string
  sourceFile: string
  schema: {
    locationFields: LocationField[]
    dataFields: DataField[]
    mappings: FieldMapping[]
  }
  records: any[]
  metadata: {
    totalRows: number
    validRows: number
    invalidRows: number
    analysisDate: string
  }
}

interface LocationField {
  column: string
  type: 'latitude' | 'longitude' | 'address' | 'country'
  required: boolean
  confidence: number
}

interface DataField {
  column: string
  type: 'numeric' | 'categorical' | 'temporal'
  visualizationType: 'size' | 'color' | 'label' | 'filter'
  range?: { min: number, max: number }
  categories?: string[]
}
```

### **3. Column Mapping Interface**

```typescript
interface VisualizationMapping {
  // Location mapping
  latitude: string | null
  longitude: string | null
  address: string | null
  
  // Data visualization
  size: string | null        // For bubble size
  color: string | null       // For color coding
  label: string | null       // For hover text
  category: string | null    // For grouping
  
  // Advanced options
  filters: Filter[]
  aggregations: Aggregation[]
  animation?: {
    timeColumn: string
    duration: number
    loop: boolean
  }
}

interface Filter {
  column: string
  type: 'range' | 'categorical' | 'boolean'
  value: any
  operator: 'equals' | 'greater' | 'less' | 'contains'
}
```

## 🎨 **User Experience Flow**

### **Step 1: Enhanced Data Upload**
- User uploads CSV/JSON file
- System performs automatic analysis:
  - Scans all columns for data types
  - Detects geographic patterns (lat/lng, addresses, countries)
  - Identifies numeric data for visualization
  - Finds categorical data for grouping
- Shows analysis results with confidence scores

### **Step 2: Smart Suggestions**
- Auto-suggest location columns based on:
  - Column names (lat, lng, latitude, longitude, address, country)
  - Data patterns (coordinate ranges, address formats)
  - Geographic keywords
- Recommend visualization mappings:
  - Suggest size columns (population, values, scores)
  - Suggest color columns (categories, regions, types)
  - Suggest label columns (names, descriptions)

### **Step 3: Interactive Mapping Interface**

```
┌─ Location Mapping ─────────────────┐
│ Latitude:  [lat_column ▼] ✓       │
│ Longitude: [lng_column ▼] ✓      │
│ Address:   [address_column ▼]    │
│ Country:   [country_column ▼]    │
└───────────────────────────────────┘

┌─ Visualization Options ────────────┐
│ Size:      [population ▼] ✓       │
│ Color:     [category ▼] ✓         │
│ Label:     [city_name ▼] ✓       │
│ Group:     [country ▼] ✓          │
└───────────────────────────────────┘

┌─ Filters & Controls ──────────────┐
│ Range Filter: [slider]            │
│ Category Filter: [checkboxes]     │
│ Time Animation: [toggle]          │
└───────────────────────────────────┘
```

### **Step 4: Real-time Preview**
- Live globe updates as user changes mappings
- Preview different visualization modes
- Show data statistics and distributions
- Allow testing of filters and controls

## 🚀 **Implementation Strategy**

### **Phase 1: Data Discovery Engine (Week 1-2)**

#### **Enhanced Dataset Import**
```typescript
// Enhanced src/lib/datasetImport.ts
export class DataAnalyzer {
  analyzeDataset(data: any[]): DatasetAnalysis {
    return {
      locationColumns: this.detectLocationColumns(data),
      numericColumns: this.detectNumericColumns(data),
      categoricalColumns: this.detectCategoricalColumns(data),
      suggestions: this.generateMappingSuggestions(data)
    }
  }
  
  private detectLocationColumns(data: any[]): LocationColumn[] {
    const locationColumns: LocationColumn[] = []
    
    // Detect latitude/longitude columns
    data[0] && Object.keys(data[0]).forEach(column => {
      const values = data.slice(0, 100).map(row => row[column])
      const latLngPattern = this.detectLatLngPattern(values)
      if (latLngPattern.confidence > 0.8) {
        locationColumns.push({
          name: column,
          type: latLngPattern.type,
          confidence: latLngPattern.confidence,
          sampleValues: values.slice(0, 5)
        })
      }
    })
    
    return locationColumns
  }
  
  private detectLatLngPattern(values: any[]): { type: string, confidence: number } {
    // Smart detection logic for coordinates
    const numericValues = values.filter(v => !isNaN(Number(v)))
    const latRange = numericValues.filter(v => v >= -90 && v <= 90)
    const lngRange = numericValues.filter(v => v >= -180 && v <= 180)
    
    if (latRange.length / numericValues.length > 0.8) {
      return { type: 'latitude', confidence: 0.9 }
    }
    if (lngRange.length / numericValues.length > 0.8) {
      return { type: 'longitude', confidence: 0.9 }
    }
    
    return { type: 'unknown', confidence: 0 }
  }
}
```

#### **New Database Schema**
```sql
-- Enhanced database schema
CREATE TABLE globe_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  source_file VARCHAR(255),
  schema JSONB NOT NULL,
  analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dataset_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES globe_datasets(id) ON DELETE CASCADE,
  mapping_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE visualization_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  mapping_config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Phase 2: Dynamic Schema Creation (Week 2-3)**

#### **Schema Generator**
```typescript
// New: src/lib/schemaGenerator.ts
export class SchemaGenerator {
  createGlobeSchema(analysis: DatasetAnalysis): GlobeSchema {
    return {
      locationFields: this.mapLocationFields(analysis.locationColumns),
      dataFields: this.mapDataFields(analysis),
      visualizationOptions: this.generateVisualizationOptions(analysis)
    }
  }
  
  private mapLocationFields(locationColumns: LocationColumn[]): LocationField[] {
    return locationColumns.map(col => ({
      column: col.name,
      type: col.type as any,
      required: col.confidence > 0.8,
      confidence: col.confidence
    }))
  }
}
```

### **Phase 3: Interactive Mapping UI (Week 3-4)**

#### **Column Mapper Component**
```typescript
// New: src/components/mapping/ColumnMapper.tsx
interface ColumnMapperProps {
  dataset: GlobeDataset
  analysis: DatasetAnalysis
  onMappingChange: (mapping: VisualizationMapping) => void
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  dataset,
  analysis,
  onMappingChange
}) => {
  const [mapping, setMapping] = useState<VisualizationMapping>({
    latitude: null,
    longitude: null,
    address: null,
    size: null,
    color: null,
    label: null,
    category: null,
    filters: [],
    aggregations: []
  })
  
  // Component implementation...
}
```

#### **Visualization Preview**
```typescript
// New: src/components/mapping/VisualizationPreview.tsx
interface VisualizationPreviewProps {
  mapping: VisualizationMapping
  data: any[]
  onPreviewUpdate: (markers: GlobeMarker[]) => void
}

export const VisualizationPreview: React.FC<VisualizationPreviewProps> = ({
  mapping,
  data,
  onPreviewUpdate
}) => {
  // Real-time preview generation
  const generatePreview = useCallback(() => {
    const markers = data.map(record => ({
      position: [
        parseFloat(record[mapping.latitude]),
        parseFloat(record[mapping.longitude])
      ],
      size: calculateSize(record[mapping.size]),
      color: calculateColor(record[mapping.color]),
      label: record[mapping.label]
    }))
    
    onPreviewUpdate(markers)
  }, [mapping, data])
  
  // Component implementation...
}
```

### **Phase 4: Enhanced Globe Visualization (Week 4-5)**

#### **Dynamic Marker Generation**
```typescript
// Enhanced src/components/globe/Globe.tsx
interface DynamicGlobeProps {
  dataset: GlobeDataset
  mapping: VisualizationMapping
  filters: Filter[]
  animation?: AnimationConfig
}

export const DynamicGlobe: React.FC<DynamicGlobeProps> = ({
  dataset,
  mapping,
  filters,
  animation
}) => {
  const generateMarkers = useCallback(() => {
    const filteredData = applyFilters(dataset.records, filters)
    
    return filteredData.map(record => ({
      position: [
        parseFloat(record[mapping.latitude]),
        parseFloat(record[mapping.longitude])
      ],
      size: calculateSize(record[mapping.size], mapping.size),
      color: calculateColor(record[mapping.color], mapping.color),
      label: record[mapping.label],
      category: record[mapping.category]
    }))
  }, [dataset, mapping, filters])
  
  // Component implementation...
}
```

## 🎯 **Advanced Features**

### **Smart Data Detection**
- **Geographic patterns**: Detect lat/lng, addresses, country codes
- **Numeric ranges**: Identify population, temperature, scores
- **Categorical data**: Detect categories, regions, types
- **Temporal data**: Detect dates, time series

### **Visualization Modes**
- **Bubble maps**: Size = numeric value, color = category
- **Heat maps**: Density visualization
- **Clustered views**: Group by category
- **Time series**: Animated data over time
- **3D visualization**: Height = value, color = category

### **Interactive Controls**
- **Filters**: Slider ranges, dropdown selections
- **Aggregations**: Sum, average, count by region
- **Animations**: Time-based data progression
- **Layers**: Multiple datasets on same globe

## 🎨 **New UI Components**

### **1. DatasetManager**
```typescript
// src/components/datasets/DatasetManager.tsx
interface DatasetManagerProps {
  datasets: GlobeDataset[]
  onDatasetSelect: (dataset: GlobeDataset) => void
  onDatasetDelete: (id: string) => void
}
```

### **2. ColumnMapper**
```typescript
// src/components/mapping/ColumnMapper.tsx
interface ColumnMapperProps {
  dataset: GlobeDataset
  analysis: DatasetAnalysis
  onMappingChange: (mapping: VisualizationMapping) => void
}
```

### **3. VisualizationControls**
```typescript
// src/components/visualization/VisualizationControls.tsx
interface VisualizationControlsProps {
  mapping: VisualizationMapping
  onMappingUpdate: (mapping: VisualizationMapping) => void
  onFilterUpdate: (filters: Filter[]) => void
}
```

### **4. DataPreview**
```typescript
// src/components/preview/DataPreview.tsx
interface DataPreviewProps {
  data: any[]
  mapping: VisualizationMapping
  onPreviewUpdate: (markers: GlobeMarker[]) => void
}
```

### **5. ExportVisualization**
```typescript
// src/components/export/ExportVisualization.tsx
interface ExportVisualizationProps {
  mapping: VisualizationMapping
  onExport: (config: VisualizationConfig) => void
}
```

## 🔧 **Enhanced Import Flow**

```
Upload File → Analyze Data → Map Columns → Preview → Save → Visualize
     ↓              ↓            ↓          ↓        ↓         ↓
  CSV/JSON    Smart Detection  Interactive  Live   Database  Globe
   Upload      & Suggestions    Mapping    Preview   Save    Render
```

## 💡 **Use Cases Enabled**

### **Research Datasets**
- Import survey data, map responses to locations
- Visualize research results geographically
- Analyze demographic patterns

### **Business Intelligence**
- Sales data visualization
- Customer location analysis
- Performance metrics mapping

### **Scientific Visualization**
- Climate data visualization
- Research results mapping
- Measurement data display

### **Social Data**
- Population statistics
- Demographic information
- Social media data mapping

### **Real-time Data**
- Live feeds visualization
- API data integration
- Streaming information display

## 📊 **Implementation Timeline**

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1** | Week 1-2 | Data Discovery Engine, Enhanced Import |
| **Phase 2** | Week 2-3 | Schema Generation, Database Updates |
| **Phase 3** | Week 3-4 | Mapping UI, Preview Components |
| **Phase 4** | Week 4-5 | Enhanced Globe, Visualization Modes |
| **Phase 5** | Week 5-6 | Advanced Features, Polish |

## 🎯 **Success Metrics**

- **User Experience**: Intuitive column mapping interface
- **Performance**: Real-time preview updates
- **Flexibility**: Support for various data types
- **Visualization**: Rich, interactive globe displays
- **Scalability**: Handle large datasets efficiently

## 🚀 **Next Steps**

1. **Start with Phase 1**: Implement data discovery engine
2. **Create proof of concept**: Basic column detection
3. **Build mapping interface**: Interactive column selection
4. **Integrate with existing Globe**: Dynamic marker generation
5. **Add advanced features**: Filters, animations, multiple datasets

---

**This proposal transforms Globe into a powerful, flexible data visualization platform that can handle any geographic dataset and create stunning interactive visualizations!** 🌍✨
