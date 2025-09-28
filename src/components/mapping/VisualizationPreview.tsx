import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  StatRoot,
  StatLabel,
  StatValueText,
  StatHelpText,
  SimpleGrid,
  ProgressRoot,
  ProgressTrack,
  ProgressRange,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { VisualizationMapping } from './ColumnMapper';

interface VisualizationPreviewProps {
  mapping: VisualizationMapping;
  data: any[];
  onPreviewUpdate: (markers: PreviewMarker[]) => void;
}

interface PreviewMarker {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  label: string;
  category?: string;
  data: any;
}

const VisualizationPreview: React.FC<VisualizationPreviewProps> = ({
  mapping,
  data,
  onPreviewUpdate
}) => {
  const [markers, setMarkers] = useState<PreviewMarker[]>([]);
  const [stats, setStats] = useState({
    totalMarkers: 0,
    validMarkers: 0,
    invalidMarkers: 0,
    sizeRange: { min: 0, max: 0 },
    colorCategories: 0
  });

  useEffect(() => {
    generatePreview();
  }, [mapping, data]);

  const generatePreview = () => {
    if (!data || data.length === 0) {
      setMarkers([]);
      onPreviewUpdate([]);
      return;
    }

    const previewMarkers: PreviewMarker[] = [];
    let validCount = 0;
    let invalidCount = 0;
    const sizes: number[] = [];
    const colors = new Set<string>();

    data.slice(0, 100).forEach((row, index) => {
      try {
        const marker = createMarkerFromRow(row, index);
        if (marker) {
          previewMarkers.push(marker);
          validCount++;
          sizes.push(marker.size);
          colors.add(marker.color);
        } else {
          invalidCount++;
        }
      } catch (error) {
        invalidCount++;
      }
    });

    setMarkers(previewMarkers);
    onPreviewUpdate(previewMarkers);

    // Update stats
    setStats({
      totalMarkers: data.length,
      validMarkers: validCount,
      invalidMarkers: invalidCount,
      sizeRange: {
        min: sizes.length > 0 ? Math.min(...sizes) : 0,
        max: sizes.length > 0 ? Math.max(...sizes) : 0
      },
      colorCategories: colors.size
    });
  };

  const createMarkerFromRow = (row: any, index: number): PreviewMarker | null => {
    // Get position
    const position = getPosition(row);
    if (!position) return null;

    // Get size
    const size = getSize(row);
    
    // Get color
    const color = getColor(row);
    
    // Get label
    const label = getLabel(row);
    
    // Get category
    const category = getCategory(row);

    return {
      id: `preview-${index}`,
      position,
      size,
      color,
      label,
      category,
      data: row
    };
  };

  const getPosition = (row: any): [number, number, number] | null => {
    let lat: number | null = null;
    let lng: number | null = null;

    // Try to get latitude
    if (mapping.latitude && row[mapping.latitude]) {
      lat = parseFloat(row[mapping.latitude]);
    }

    // Try to get longitude
    if (mapping.longitude && row[mapping.longitude]) {
      lng = parseFloat(row[mapping.longitude]);
    }

    // If we have both, convert to 3D coordinates
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return latLngToVector3(lat, lng);
    }

    return null;
  };

  const getSize = (row: any): number => {
    if (mapping.size && row[mapping.size]) {
      const value = parseFloat(row[mapping.size]);
      if (!isNaN(value)) {
        // Normalize size to 0.5-2.0 range
        return Math.max(0.5, Math.min(2.0, value / 10));
      }
    }
    return 1.0; // Default size
  };

  const getColor = (row: any): string => {
    if (mapping.color && row[mapping.color]) {
      const value = String(row[mapping.color]);
      // Generate color based on value
      return generateColorFromValue(value);
    }
    return '#00ff88'; // Default green
  };

  const getLabel = (row: any): string => {
    if (mapping.label && row[mapping.label]) {
      return String(row[mapping.label]);
    }
    return 'Unknown';
  };

  const getCategory = (row: any): string | undefined => {
    if (mapping.category && row[mapping.category]) {
      return String(row[mapping.category]);
    }
    return undefined;
  };

  // Helper functions
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2.01): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return [
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ];
  };

  const generateColorFromValue = (value: string): string => {
    // Simple hash-based color generation
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getValidationStatus = () => {
    if (stats.validMarkers === 0) return 'error';
    if (stats.validMarkers < stats.totalMarkers * 0.8) return 'warning';
    return 'success';
  };

  const getValidationMessage = () => {
    if (stats.validMarkers === 0) return 'No valid markers could be created';
    if (stats.validMarkers < stats.totalMarkers * 0.8) return 'Some markers may not display correctly';
    return 'All markers are valid';
  };

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="md">
      <VStack align="stretch" gap={4}>
        <Text fontSize="lg" fontWeight="bold" color="gray.800">
          Visualization Preview
        </Text>

        {/* Validation Status */}
        <AlertRoot status={getValidationStatus()}>
          <AlertIndicator />
          <AlertContent>
            <Text fontSize="sm">{getValidationMessage()}</Text>
          </AlertContent>
        </AlertRoot>

        {/* Statistics */}
        <SimpleGrid columns={2} gap={4}>
          <StatRoot>
            <StatLabel>Total Markers</StatLabel>
            <StatValueText>{stats.totalMarkers}</StatValueText>
            <StatHelpText>In dataset</StatHelpText>
          </StatRoot>
          
          <StatRoot>
            <StatLabel>Valid Markers</StatLabel>
            <StatValueText color="green.500">{stats.validMarkers}</StatValueText>
            <StatHelpText>Will be displayed</StatHelpText>
          </StatRoot>
        </SimpleGrid>

        {/* Size Range */}
        {mapping.size && (
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Size Range</Text>
            <HStack gap={2}>
              <Badge colorScheme="blue">
                Min: {stats.sizeRange.min.toFixed(2)}
              </Badge>
              <Badge colorScheme="blue">
                Max: {stats.sizeRange.max.toFixed(2)}
              </Badge>
            </HStack>
            <ProgressRoot
              value={(stats.sizeRange.max - stats.sizeRange.min) * 50}
              colorScheme="blue"
              size="sm"
              mt={2}
            >
              <ProgressTrack />
              <ProgressRange />
            </ProgressRoot>
          </Box>
        )}

        {/* Color Categories */}
        {mapping.color && (
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Color Categories</Text>
            <Badge colorScheme="purple">
              {stats.colorCategories} unique values
            </Badge>
          </Box>
        )}

        {/* Sample Markers */}
        {markers.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Sample Markers</Text>
            <VStack gap={1} align="stretch" maxH="200px" overflowY="auto">
              {markers.slice(0, 10).map((marker, index) => (
                <HStack key={index} gap={2} p={2} bg="gray.50" borderRadius="md">
                  <Box
                    w="12px"
                    h="12px"
                    borderRadius="50%"
                    bg={marker.color}
                    flexShrink={0}
                  />
                  <Text fontSize="xs" flex={1}>
                    {marker.label}
                  </Text>
                  <Badge size="sm" colorScheme="blue">
                    {marker.size.toFixed(1)}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        {/* Actions */}
        <HStack gap={2}>
          <Button size="sm" colorScheme="blue" onClick={generatePreview}>
            Refresh Preview
          </Button>
          <Button size="sm" variant="outline" onClick={() => onPreviewUpdate(markers)}>
            Apply to Globe
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default VisualizationPreview;
