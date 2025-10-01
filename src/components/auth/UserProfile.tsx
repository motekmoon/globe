import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
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
} from "@chakra-ui/react";
import { UserIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
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
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const displayName = user.user_metadata?.name || user.email.split("@")[0];

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
            px={3}
            h="25px"
            bg="rgba(255, 255, 255, 0.1)"
            color="white"
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
            borderRadius="md"
          >
            <HStack gap={2}>
              <Icon as={UserIcon} boxSize={4} color="white" />
              <Text
                fontSize={{ base: "0.6rem", sm: "0.7rem" }}
                fontWeight="600"
                display={{ base: "none", md: "block" }}
              >
                {displayName}
              </Text>
            </HStack>
          </Button>
        </MenuTrigger>

        <MenuContent minW="200px" position="absolute" zIndex={50}>
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
            <Text fontSize="sm">Profile Settings</Text>
          </MenuItem>

          <MenuItem onClick={() => setShowAnalytics(!showAnalytics)}>
            <Text fontSize="sm">Usage Analytics</Text>
          </MenuItem>

          <MenuItem onClick={() => console.log("Export data")}>
            <Text fontSize="sm">Export Data</Text>
          </MenuItem>

          <MenuSeparator />

          <MenuItem
            onClick={handleSignOut}
            disabled={isSigningOut || loading}
            color="red.600"
          >
            <Text fontSize="sm">
              {isSigningOut ? "Signing out..." : "Sign Out"}
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
              Your Analytics
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAnalytics(false)}
            >
              ×
            </Button>
          </HStack>
          <UserAnalytics />
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
