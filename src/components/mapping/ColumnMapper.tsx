import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
  Button,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
  Badge,
  Separator,
} from '@chakra-ui/react';
import { DatasetAnalysis, MappingSuggestion } from '../../lib/dataDiscovery';
import { GlobeSchema } from '../../lib/schemaGenerator';

interface ColumnMapperProps {
  analysis: DatasetAnalysis;
  schema: GlobeSchema;
  onMappingChange: (mapping: VisualizationMapping) => void;
  onApplyMapping: (mapping: VisualizationMapping) => void;
}

export interface VisualizationMapping {
  // Location mapping
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  
  // Data visualization
  size: string | null;
  color: string | null;
  label: string | null;
  category: string | null;
  
  // Advanced options
  filters: Filter[];
  aggregations: Aggregation[];
}

interface Filter {
  column: string;
  type: 'range' | 'categorical' | 'boolean';
  value: any;
  operator: 'equals' | 'greater' | 'less' | 'contains';
}

interface Aggregation {
  column: string;
  type: 'sum' | 'average' | 'count' | 'max' | 'min';
}

const ColumnMapper: React.FC<ColumnMapperProps> = ({
  analysis,
  schema,
  onMappingChange,
  onApplyMapping
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
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Auto-populate mapping based on suggestions
  useEffect(() => {
    const autoMapping = generateAutoMapping(analysis);
    setMapping(autoMapping);
    onMappingChange(autoMapping);
  }, [analysis, onMappingChange]);

  const handleMappingChange = (field: keyof VisualizationMapping, value: string | null) => {
    const newMapping = { ...mapping, [field]: value };
    setMapping(newMapping);
    onMappingChange(newMapping);
    
    // Validate mapping
    const errors = validateMapping(newMapping, schema);
    setValidationErrors(errors);
  };

  const handleApplyMapping = () => {
    if (validationErrors.length === 0) {
      onApplyMapping(mapping);
    }
  };

  const getAvailableFields = (type: 'location' | 'numeric' | 'categorical') => {
    switch (type) {
      case 'location':
        return [
          ...analysis.locationColumns.map(col => ({ value: col.name, label: col.name })),
          { value: '', label: 'None' }
        ];
      case 'numeric':
        return [
          ...analysis.numericColumns.map(col => ({ value: col.name, label: col.name })),
          { value: '', label: 'None' }
        ];
      case 'categorical':
        return [
          ...analysis.categoricalColumns.map(col => ({ value: col.name, label: col.name })),
          { value: '', label: 'None' }
        ];
      default:
        return [{ value: '', label: 'None' }];
    }
  };

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="md">
      <VStack align="stretch" gap={4}>
        <Text fontSize="lg" fontWeight="bold" color="gray.800">
          Column Mapping
        </Text>
        
        {/* Dataset Analysis Summary */}
        <Box p={3} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="semibold" mb={2}>Dataset Analysis</Text>
          <HStack gap={4} wrap="wrap">
            <Badge colorScheme="blue">{analysis.totalRows} rows</Badge>
            <Badge colorScheme="green">{analysis.locationColumns.length} location fields</Badge>
            <Badge colorScheme="orange">{analysis.numericColumns.length} numeric fields</Badge>
            <Badge colorScheme="purple">{analysis.categoricalColumns.length} categorical fields</Badge>
          </HStack>
        </Box>

        {/* Location Mapping */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" mb={2}>Location Fields</Text>
          <VStack gap={2}>
            <HStack gap={2} align="center">
              <Text fontSize="sm" w="80px">Latitude:</Text>
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={mapping.latitude || ''}
                  onChange={(e) => handleMappingChange('latitude', e.target.value || null)}
                >
                  {getAvailableFields('location').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </HStack>
            
            <HStack gap={2} align="center">
              <Text fontSize="sm" w="80px">Longitude:</Text>
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={mapping.longitude || ''}
                  onChange={(e) => handleMappingChange('longitude', e.target.value || null)}
                >
                  {getAvailableFields('location').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </HStack>
            
            <HStack gap={2} align="center">
              <Text fontSize="sm" w="80px">Address:</Text>
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={mapping.address || ''}
                  onChange={(e) => handleMappingChange('address', e.target.value || null)}
                >
                  {getAvailableFields('location').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </HStack>
          </VStack>
        </Box>

        <Separator />

        {/* Visualization Mapping */}
        <Box>
          <Text fontSize="md" fontWeight="semibold" mb={2}>Visualization Fields</Text>
          <VStack gap={2}>
            <HStack gap={2} align="center">
              <Text fontSize="sm" w="80px">Size:</Text>
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={mapping.size || ''}
                  onChange={(e) => handleMappingChange('size', e.target.value || null)}
                >
                  {getAvailableFields('numeric').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </HStack>
            
            <HStack gap={2} align="center">
              <Text fontSize="sm" w="80px">Color:</Text>
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={mapping.color || ''}
                  onChange={(e) => handleMappingChange('color', e.target.value || null)}
                >
                  {getAvailableFields('categorical').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </HStack>
            
            <HStack gap={2} align="center">
              <Text fontSize="sm" w="80px">Label:</Text>
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={mapping.label || ''}
                  onChange={(e) => handleMappingChange('label', e.target.value || null)}
                >
                  {getAvailableFields('categorical').map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>
            </HStack>
          </VStack>
        </Box>

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <Box>
            <Text fontSize="md" fontWeight="semibold" mb={2}>Smart Suggestions</Text>
            <VStack gap={1} align="stretch">
              {analysis.suggestions.slice(0, 5).map((suggestion, index) => (
                <Box key={index} p={2} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm">
                    <strong>{suggestion.field}</strong> → {suggestion.suggestedMapping}
                    <Badge ml={2} colorScheme="green" size="sm">
                      {(suggestion.confidence * 100).toFixed(0)}%
                    </Badge>
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {suggestion.reasoning}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <AlertRoot status="error">
            <AlertIndicator />
            <AlertContent>
              <AlertTitle>Mapping Errors:</AlertTitle>
              <AlertDescription>
                <VStack align="stretch" gap={1}>
                  {validationErrors.map((error, index) => (
                    <Text key={index} fontSize="sm">• {error}</Text>
                  ))}
                </VStack>
              </AlertDescription>
            </AlertContent>
          </AlertRoot>
        )}

        {/* Apply Button */}
        <Button
          colorScheme="blue"
          onClick={handleApplyMapping}
          disabled={validationErrors.length > 0}
          size="sm"
        >
          Apply Mapping
        </Button>
      </VStack>
    </Box>
  );
};

// Helper functions
const generateAutoMapping = (analysis: DatasetAnalysis): VisualizationMapping => {
  const mapping: VisualizationMapping = {
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

  // Auto-map based on suggestions
  analysis.suggestions.forEach(suggestion => {
    if (suggestion.suggestedMapping === 'latitude' && !mapping.latitude) {
      mapping.latitude = suggestion.field;
    } else if (suggestion.suggestedMapping === 'longitude' && !mapping.longitude) {
      mapping.longitude = suggestion.field;
    } else if (suggestion.suggestedMapping === 'address' && !mapping.address) {
      mapping.address = suggestion.field;
    } else if (suggestion.suggestedMapping === 'size' && !mapping.size) {
      mapping.size = suggestion.field;
    } else if (suggestion.suggestedMapping === 'color' && !mapping.color) {
      mapping.color = suggestion.field;
    } else if (suggestion.suggestedMapping === 'label' && !mapping.label) {
      mapping.label = suggestion.field;
    }
  });

  return mapping;
};

const validateMapping = (mapping: VisualizationMapping, schema: GlobeSchema): string[] => {
  const errors: string[] = [];

  // Check required location fields
  if (!mapping.latitude && !mapping.longitude) {
    errors.push('Either latitude or longitude must be mapped');
  }

  // Check for valid field mappings
  const allFields = [
    ...schema.locationFields.map(f => f.column),
    ...schema.dataFields.map(f => f.column)
  ];

  Object.entries(mapping).forEach(([key, value]) => {
    if (value && typeof value === 'string' && !allFields.includes(value)) {
      errors.push(`Field ${value} does not exist in dataset`);
    }
  });

  return errors;
};

export default ColumnMapper;
