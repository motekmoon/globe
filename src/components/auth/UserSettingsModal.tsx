import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
  Icon,
} from '@chakra-ui/react';
import { UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, loading, error, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Form state
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle form submission
  const handleUpdate = async () => {
    if (!user) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Validate password if provided
      if (newPassword && newPassword !== confirmPassword) {
        setUpdateError('Passwords do not match');
        return;
      }

      if (newPassword && newPassword.length < 6) {
        setUpdateError('Password must be at least 6 characters long');
        return;
      }

      const updates: { name?: string; email?: string; password?: string } = {};
      
      // Check if name has changed
      if (name !== user.user_metadata?.name) {
        updates.name = name;
      }
      
      // Check if email has changed
      if (email !== user.email) {
        updates.email = email;
      }

      // Check if password has been provided
      if (newPassword) {
        updates.password = newPassword;
      }
      
      const { success, error } = await updateUserProfile(updates);
      
      if (success) {
        setUpdateSuccess(true);
        // Don't auto-close modal - let user close it manually
        // This allows them to read the email confirmation instructions
      } else {
        setUpdateError(error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setUpdateError(null);
    setUpdateSuccess(false);
    onClose();
  };

  if (!user) return null;

  return (
    <DialogRoot open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        maxW="400px" 
        position="fixed" 
        top="50%" 
        left="50%" 
        transform="translate(-50%, -50%)"
        zIndex={9999}
        bg="white"
        borderRadius="md"
        boxShadow="xl"
        p={0}
      >
        {/* Close Button - Upper Right */}
        <Button
          position="absolute"
          top="12px"
          right="12px"
          variant="ghost"
          size="sm"
          onClick={handleClose}
          p={1}
          zIndex={10}
        >
          <Icon as={XMarkIcon} boxSize={4} />
        </Button>
        <DialogHeader p={6} pb={4}>
          <HStack gap={3}>
            <Icon as={UserIcon} boxSize={5} color="blue.500" />
            <Text fontSize="lg" fontWeight="semibold">
              User Settings
            </Text>
          </HStack>
        </DialogHeader>

        <DialogBody p={6} pt={0}>
          {/* Error Display */}
          {updateError && (
            <AlertRoot status="error" mb={4}>
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>Update Failed</AlertTitle>
                <AlertDescription>{updateError}</AlertDescription>
              </AlertContent>
            </AlertRoot>
          )}

          {/* Success Display */}
          {updateSuccess && (
            <AlertRoot status="success" mb={4}>
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>Profile Updated</AlertTitle>
                <AlertDescription>
                  {email !== user?.email 
                    ? "Your settings have been saved. Please check BOTH your old and new email inboxes for confirmation links. You must click the confirmation link in BOTH emails to complete the email change."
                    : "Your settings have been saved successfully."
                  }
                </AlertDescription>
              </AlertContent>
            </AlertRoot>
          )}

          {/* User Info Display */}
          <Box mb={6} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
              Account Information
            </Text>
            <VStack gap={2} align="start">
              <Text fontSize="sm" color="gray.600">
                <strong>User ID:</strong> {user.id}
              </Text>
            </VStack>
          </Box>

          {/* Settings Form */}
          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                Display Name
              </Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                disabled={isUpdating}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                Email Address
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isUpdating}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
                Change Password
              </Text>
              <VStack gap={2} align="stretch">
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isUpdating}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdating}
                />
              </VStack>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter p={6} pt={4}>
          <HStack gap={2} w="100%">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
              flex={1}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpdate}
              loading={isUpdating}
              loadingText="Updating..."
              disabled={!name.trim() || !email.trim() || (newPassword && newPassword !== confirmPassword) || isUpdating}
              flex={1}
            >
              Save Changes
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default UserSettingsModal;
