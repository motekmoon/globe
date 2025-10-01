import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  ModalRoot,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signUp, signIn, loading, error, clearError } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('signin');

  // Handle form submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!email || !password) {
      return;
    }

    const result = await signIn(email, password);
    if (result.success) {
      onClose();
      resetForm();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    const result = await signUp(email, password, name || undefined);
    if (result.success) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setActiveTab('signin');
    clearError();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <ModalRoot open={isOpen} onOpenChange={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="md" mx="auto" mt="10vh">
        <ModalCloseButton />
        <ModalHeader>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Welcome to Globe
          </Text>
          <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
            Sign in to save your projects and track your progress
          </Text>
        </ModalHeader>
        
        <ModalBody pb={6}>
          <TabsRoot value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Error Display */}
            {error && (
              <AlertRoot status="error" mt={4}>
                <AlertIndicator />
                <AlertContent>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </AlertContent>
              </AlertRoot>
            )}

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <VStack spacing={4} mt={4}>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="100%"
                    isLoading={loading}
                    loadingText="Signing in..."
                    disabled={!email || !password}
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <VStack spacing={4} mt={4}>
                  <Input
                    type="text"
                    placeholder="Full name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="100%"
                    isLoading={loading}
                    loadingText="Creating account..."
                    disabled={!email || !password || !confirmPassword || password !== confirmPassword}
                  >
                    Create Account
                  </Button>
                </VStack>
              </form>
            </TabsContent>
          </TabsRoot>

          {/* Benefits Section */}
          <Box mt={6} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" mb={2}>
              Why sign up?
            </Text>
            <VStack spacing={2} align="start">
              <HStack>
                <Text fontSize="sm">💾</Text>
                <Text fontSize="sm">Save your projects in the cloud</Text>
              </HStack>
              <HStack>
                <Text fontSize="sm">📊</Text>
                <Text fontSize="sm">Track your visualization progress</Text>
              </HStack>
              <HStack>
                <Text fontSize="sm">🔄</Text>
                <Text fontSize="sm">Sync across devices</Text>
              </HStack>
              <HStack>
                <Text fontSize="sm">🚀</Text>
                <Text fontSize="sm">Get early access to new features</Text>
              </HStack>
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </ModalRoot>
  );
};

export default AuthModal;
