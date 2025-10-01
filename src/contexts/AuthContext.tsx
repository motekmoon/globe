import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthSession, AuthError, authService } from '../lib/supabase';

// Context state interface
interface AuthContextState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Context actions interface
interface AuthContextActions {
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  trackAction: (action: string, metadata?: Record<string, any>) => void;
  clearError: () => void;
}

// Combined context type
type AuthContextType = AuthContextState & AuthContextActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed state
  const isAuthenticated = !!user && !!session;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { session: currentSession, error: sessionError } = await authService.getSession();
        
        if (sessionError) {
          console.error('Auth initialization error:', sessionError);
          setError(sessionError.message);
        } else if (currentSession) {
          setUser(currentSession.user);
          setSession(currentSession);
          console.log('✅ User authenticated:', currentSession.user.email);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const { user: newUser, error: signUpError } = await authService.signUp(
        email, 
        password, 
        name ? { name } : undefined
      );

      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      if (newUser) {
        setUser(newUser);
        console.log('✅ User signed up successfully:', newUser.email);
        return { success: true };
      }

      return { success: false, error: 'Signup failed' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const { user: signedInUser, session: newSession, error: signInError } = await authService.signIn(email, password);

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      if (signedInUser && newSession) {
        setUser(signedInUser);
        setSession(newSession);
        console.log('✅ User signed in successfully:', signedInUser.email);
        
        // Track sign in action
        trackAction('user_signin', { email: signedInUser.email });
        
        return { success: true };
      }

      return { success: false, error: 'Signin failed' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signin failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Track sign out action
      if (user) {
        trackAction('user_signout', { email: user.email });
      }

      const { error: signOutError } = await authService.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return;
      }

      setUser(null);
      setSession(null);
      console.log('✅ User signed out successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signout failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Track user action
  const trackAction = (action: string, metadata?: Record<string, any>): void => {
    if (user) {
      authService.trackUserAction(user.id, action, metadata);
    }
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    // State
    user,
    session,
    loading,
    error,
    isAuthenticated,

    // Actions
    signUp,
    signIn,
    signOut,
    trackAction,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
