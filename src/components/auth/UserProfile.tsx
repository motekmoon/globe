import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, signOut, loading, error } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const displayName = user.user_metadata?.name || user.email.split('@')[0];

  return (
    <Box>
      {/* Error Display */}
      {error && (
        <AlertRoot status="error" mb={4}>
          <AlertIndicator />
          <AlertContent>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </AlertContent>
        </AlertRoot>
      )}

      <MenuRoot>
        <MenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            p={2}
            h="auto"
            bg="rgba(255, 255, 255, 0.1)"
            color="white"
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
            borderRadius="full"
          >
            <HStack spacing={2}>
              <Avatar
                size="sm"
                name={displayName}
                bg="blue.500"
                color="white"
                fontSize="xs"
              />
              <VStack spacing={0} align="start" display={{ base: "none", md: "flex" }}>
                <Text fontSize="sm" fontWeight="medium">
                  {displayName}
                </Text>
                <Text fontSize="xs" color="gray.300">
                  {user.email}
                </Text>
              </VStack>
            </HStack>
          </Button>
        </MenuTrigger>

        <MenuContent minW="200px">
          <VStack spacing={2} p={3} align="start">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              {displayName}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {user.email}
            </Text>
            <Text fontSize="xs" color="gray.400">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </VStack>
          
          <MenuSeparator />
          
          <MenuItem onClick={() => console.log('Profile settings')}>
            <Text fontSize="sm">⚙️ Profile Settings</Text>
          </MenuItem>
          
          <MenuItem onClick={() => console.log('Usage analytics')}>
            <Text fontSize="sm">📊 Usage Analytics</Text>
          </MenuItem>
          
          <MenuItem onClick={() => console.log('Export data')}>
            <Text fontSize="sm">📤 Export Data</Text>
          </MenuItem>
          
          <MenuSeparator />
          
          <MenuItem 
            onClick={handleSignOut}
            disabled={isSigningOut || loading}
            color="red.600"
          >
            <Text fontSize="sm">
              {isSigningOut ? 'Signing out...' : '🚪 Sign Out'}
            </Text>
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Box>
  );
};

export default UserProfile;
