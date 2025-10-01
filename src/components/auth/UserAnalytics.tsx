import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  CardRoot,
  CardHeader,
  CardBody,
  StatRoot,
  StatLabel,
  StatValueText,
  StatGroup,
  ProgressRoot,
  ProgressTrack,
  ProgressRange,
  Badge,
  Separator,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

interface UserStats {
  total_locations: number;
  total_actions: number;
  last_activity: string;
  created_at: string;
}

const UserAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // In development, use mock data
      if (process.env.NODE_ENV === 'development') {
        setStats({
          total_locations: 15,
          total_actions: 42,
          last_activity: new Date().toISOString(),
          created_at: user.created_at
        });
        return;
      }

      // In production, call Supabase function
      const response = await fetch('/api/user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user, fetchUserStats]);

  if (!user || !stats) {
    return null;
  }

  const daysSinceJoined = user ? Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

  const activityLevel = Math.min(stats.total_actions / Math.max(daysSinceJoined, 1), 10);

  return (
    <CardRoot>
      <CardHeader>
        <Text fontSize="lg" fontWeight="semibold">
          📊 Your Analytics
        </Text>
      </CardHeader>
      <CardBody>
        <VStack gap={4} align="stretch">
          {/* Overview Stats */}
          <StatGroup>
            <StatRoot>
              <StatLabel>Locations Created</StatLabel>
              <StatValueText>{stats.total_locations}</StatValueText>
            </StatRoot>
            <StatRoot>
              <StatLabel>Total Actions</StatLabel>
              <StatValueText>{stats.total_actions}</StatValueText>
            </StatRoot>
            <StatRoot>
              <StatLabel>Days Active</StatLabel>
              <StatValueText>{daysSinceJoined}</StatValueText>
            </StatRoot>
          </StatGroup>

          <Separator />

          {/* Activity Level */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium">
                Activity Level
              </Text>
              <Badge colorScheme={activityLevel > 5 ? "green" : activityLevel > 2 ? "yellow" : "gray"}>
                {activityLevel > 5 ? "High" : activityLevel > 2 ? "Medium" : "Low"}
              </Badge>
            </HStack>
            <ProgressRoot value={activityLevel * 10} max={100}>
              <ProgressTrack>
                <ProgressRange />
              </ProgressTrack>
            </ProgressRoot>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {activityLevel.toFixed(1)} actions per day
            </Text>
          </Box>

          <Separator />

          {/* Recent Activity */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Last Activity
            </Text>
            <Text fontSize="sm" color="gray.600">
              {new Date(stats.last_activity).toLocaleDateString()} at{' '}
              {new Date(stats.last_activity).toLocaleTimeString()}
            </Text>
          </Box>

          {/* Member Since */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Member Since
            </Text>
            <Text fontSize="sm" color="gray.600">
              {user ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </Box>

          {/* Refresh Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={fetchUserStats}
            loading={loading}
            loadingText="Loading..."
          >
            🔄 Refresh Stats
          </Button>
        </VStack>
      </CardBody>
    </CardRoot>
  );
};

export default UserAnalytics;
