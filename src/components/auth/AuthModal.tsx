import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogCloseTrigger,
  DialogHeader,
  DialogBody,
  AlertRoot,
  AlertIndicator,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signUp, signIn, loading, error, clearError } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

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
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setActiveTab("signin");
    clearError();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Debug current state
  console.log("AuthModal render - activeTab:", activeTab);

  return (
    <DialogRoot open={isOpen} onOpenChange={handleClose}>
      <DialogBackdrop />
      <DialogContent maxW="md" mx="auto" mt="10vh">
        <DialogCloseTrigger />
        <DialogHeader>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Welcome to Globe
          </Text>
          <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
            Sign in to save your projects and track your progress
          </Text>
          {process.env.NODE_ENV === "development" &&
            !process.env.REACT_APP_SUPABASE_URL && (
              <Box
                mt={2}
                p={2}
                bg="yellow.50"
                borderRadius="md"
                border="1px solid"
                borderColor="yellow.200"
              >
                <Text fontSize="xs" color="yellow.700" textAlign="center">
                  🔧 Development Mode: Using mock authentication. Set
                  REACT_APP_SUPABASE_URL for real accounts.
                </Text>
              </Box>
            )}
        </DialogHeader>

        <DialogBody pb={6}>
          {/* Manual Tab Navigation */}
          <HStack gap={0} mb={4}>
            <Button
              variant={activeTab === "signin" ? "solid" : "ghost"}
              colorScheme={activeTab === "signin" ? "blue" : "gray"}
              onClick={() => {
                console.log("Manual click - switching to signin");
                setActiveTab("signin");
              }}
              flex={1}
              borderRadius="md"
            >
              Sign In
            </Button>
            <Button
              variant={activeTab === "signup" ? "solid" : "ghost"}
              colorScheme={activeTab === "signup" ? "blue" : "gray"}
              onClick={() => {
                console.log("Manual click - switching to signup");
                setActiveTab("signup");
              }}
              flex={1}
              borderRadius="md"
            >
              Sign Up
            </Button>
          </HStack>

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

          {/* Sign In Form */}
          {activeTab === "signin" && (
            <Box>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Sign in to your existing account
              </Text>
              <form onSubmit={handleSignIn}>
                <VStack gap={4} mt={4}>
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
                    loading={loading}
                    loadingText="Signing in..."
                    disabled={!email || !password}
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>
            </Box>
          )}

          {/* Sign Up Form */}
          {activeTab === "signup" && (
            <Box>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Create a new account to save your projects
              </Text>
              <form onSubmit={handleSignUp}>
                <VStack gap={4} mt={4}>
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
                    loading={loading}
                    loadingText="Creating account..."
                    disabled={
                      !email ||
                      !password ||
                      !confirmPassword ||
                      password !== confirmPassword
                    }
                  >
                    Create Account
                  </Button>
                </VStack>
              </form>
            </Box>
          )}

          {/* Benefits Section */}
          <Box mt={6} p={4} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" mb={2}>
              Why sign up?
            </Text>
            <VStack gap={2} align="start">
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
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default AuthModal;
