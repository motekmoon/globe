import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Separator,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import ColumnMapper from '../mapping/ColumnMapper';
import VisualizationPreview from '../mapping/VisualizationPreview';
import { dataAnalyzer, DatasetAnalysis } from '../../lib/dataDiscovery';
import { schemaGenerator, GlobeSchema } from '../../lib/schemaGenerator';
import { VisualizationMapping } from '../mapping/ColumnMapper';

interface DynamicVisualizationProps {
  data: any[];
  onVisualizationUpdate: (markers: DynamicMarker[]) => void;
  onClose: () => void;
}

interface DynamicMarker {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  label: string;
  category?: string;
  data: any;
}

const DynamicVisualization: React.FC<DynamicVisualizationProps> = ({
  data,
  onVisualizationUpdate,
  onClose
}) => {
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);
  const [schema, setSchema] = useState<GlobeSchema | null>(null);
  const [mapping, setMapping] = useState<VisualizationMapping | null>(null);
  const [previewMarkers, setPreviewMarkers] = useState<DynamicMarker[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze dataset on mount
  useEffect(() => {
    analyzeDataset();
  }, [data]);

  const analyzeDataset = async () => {
    if (!data || data.length === 0) {
      setError('No data provided for analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Perform data analysis
      const analysisResult = dataAnalyzer.analyzeDataset(data);
      setAnalysis(analysisResult);

      // Generate schema
      const schemaResult = schemaGenerator.createGlobeSchema(analysisResult);
      setSchema(schemaResult);

      // Generate default mapping
      const defaultMapping = schemaGenerator.generateDefaultMapping(analysisResult);
      setMapping(defaultMapping);

    } catch (err) {
      setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMappingChange = (newMapping: VisualizationMapping) => {
    setMapping(newMapping);
  };

  const handleApplyMapping = (newMapping: VisualizationMapping) => {
    setMapping(newMapping);
  };

  const handlePreviewUpdate = (markers: DynamicMarker[]) => {
    setPreviewMarkers(markers);
  };

  const handleApplyVisualization = () => {
    if (previewMarkers.length > 0) {
      onVisualizationUpdate(previewMarkers);
    }
  };

  const getAnalysisSummary = () => {
    if (!analysis) return null;

    return {
      totalRows: analysis.totalRows,
      locationFields: analysis.locationColumns.length,
      numericFields: analysis.numericColumns.length,
      categoricalFields: analysis.categoricalColumns.length,
      suggestions: analysis.suggestions.length
    };
  };

  const summary = getAnalysisSummary();

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.8)"
      zIndex={2000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="xl"
        maxW="1200px"
        maxH="90vh"
        overflow="auto"
        w="100%"
      >
        <VStack align="stretch" gap={0}>
          {/* Header */}
          <Box p={4} borderBottom="1px solid" borderColor="gray.200">
            <HStack justify="space-between" align="center">
              <Text fontSize="xl" fontWeight="bold" color="gray.800">
                Visualization Settings
              </Text>
              <Button size="sm" variant="outline" onClick={onClose}>
                Close
              </Button>
            </HStack>
          </Box>

          {/* Content */}
          <Box p={4}>
            {isAnalyzing && (
              <AlertRoot status="info">
                <AlertIndicator />
                <AlertContent>
                  <AlertTitle>Analyzing dataset...</AlertTitle>
                  <AlertDescription>
                    Processing {data.length} rows to detect column types and generate mapping suggestions.
                  </AlertDescription>
                </AlertContent>
              </AlertRoot>
            )}

            {error && (
              <AlertRoot status="error" mb={4}>
                <AlertIndicator />
                <AlertContent>
                  <AlertTitle>Analysis Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </AlertContent>
              </AlertRoot>
            )}

            {summary && (
              <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold" mb={2}>Dataset Analysis Summary</Text>
                <HStack gap={4} wrap="wrap">
                  <Badge colorScheme="blue">{summary.totalRows} rows</Badge>
                  <Badge colorScheme="green">{summary.locationFields} location fields</Badge>
                  <Badge colorScheme="orange">{summary.numericFields} numeric fields</Badge>
                  <Badge colorScheme="purple">{summary.categoricalFields} categorical fields</Badge>
                  <Badge colorScheme="teal">{summary.suggestions} suggestions</Badge>
                </HStack>
              </Box>
            )}

            {analysis && schema && mapping && (
              <VStack align="stretch" gap={4}>
                {/* Column Mapping */}
                <ColumnMapper
                  analysis={analysis}
                  schema={schema}
                  onMappingChange={handleMappingChange}
                  onApplyMapping={handleApplyMapping}
                />

                <Separator />

                {/* Visualization Preview */}
                <VisualizationPreview
                  mapping={mapping}
                  data={data}
                  onPreviewUpdate={handlePreviewUpdate}
                />

                {/* Actions */}
                <HStack gap={2} justify="flex-end">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleApplyVisualization}
                    disabled={previewMarkers.length === 0}
                  >
                    Apply Visualization ({previewMarkers.length} markers)
                  </Button>
                </HStack>
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default DynamicVisualization;
