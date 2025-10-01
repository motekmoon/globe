import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
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
import UserAnalytics from "./UserAnalytics";

const UserProfile: React.FC = () => {
  const { user, signOut, loading, error } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
            <HStack gap={2}>
              <AvatarRoot size="sm">
                <AvatarFallback bg="blue.500" color="white" fontSize="xs">
                  {getInitials(displayName)}
                </AvatarFallback>
              </AvatarRoot>
              <VStack
                gap={0}
                align="start"
                display={{ base: "none", md: "flex" }}
              >
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
          <VStack gap={2} p={3} align="start">
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

          <MenuItem onClick={() => console.log("Profile settings")}>
            <Text fontSize="sm">⚙️ Profile Settings</Text>
          </MenuItem>

          <MenuItem onClick={() => setShowAnalytics(!showAnalytics)}>
            <Text fontSize="sm">📊 Usage Analytics</Text>
          </MenuItem>

          <MenuItem onClick={() => console.log("Export data")}>
            <Text fontSize="sm">📤 Export Data</Text>
          </MenuItem>

          <MenuSeparator />

          <MenuItem
            onClick={handleSignOut}
            disabled={isSigningOut || loading}
            color="red.600"
          >
            <Text fontSize="sm">
              {isSigningOut ? "Signing out..." : "🚪 Sign Out"}
            </Text>
          </MenuItem>
        </MenuContent>
      </MenuRoot>

      {/* Analytics Modal */}
      {showAnalytics && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={1000}
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="xl"
          maxW="md"
          w="90%"
        >
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              📊 Your Analytics
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAnalytics(false)}
            >
              ✕
            </Button>
          </HStack>
          <UserAnalytics />
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
