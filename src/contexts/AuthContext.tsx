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
  updateUserProfile: (updates: { name?: string; email?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
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

  // Listen for auth state changes (including email confirmations)
  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Convert Supabase user to our AuthUser type
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
            user_metadata: session.user.user_metadata
          };
          const authSession: AuthSession = {
            user: authUser,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          };
          setUser(authUser);
          setSession(authSession);
          console.log('✅ User session updated:', authUser.email);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        console.log('✅ User signed out');
      } else if (event === 'USER_UPDATED') {
        // Handle email confirmation and other user updates
        if (session?.user) {
          // Convert Supabase user to our AuthUser type
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
            user_metadata: session.user.user_metadata
          };
          const authSession: AuthSession = {
            user: authUser,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at
          };
          setUser(authUser);
          setSession(authSession);
          console.log('✅ User updated (email confirmed):', authUser.email);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
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
        console.log("✅ User signed up successfully");

        // Show development mode notification
        if (process.env.NODE_ENV === "development") {
          console.log(
            "🔧 Development Mode: Mock account created. Set REACT_APP_SUPABASE_URL for real authentication."
          );
        }
        
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
        console.log("✅ User signed in successfully");
        
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

  // Update user profile
  const updateUserProfile = async (updates: { name?: string; email?: string; password?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        updates.name ? authService.updateUserMetadata({ name: updates.name }) : Promise.resolve({ success: true }),
        updates.email ? authService.updateUserEmail(updates.email) : Promise.resolve({ success: true }),
        updates.password ? authService.updateUserPassword(updates.password) : Promise.resolve({ success: true })
      ]);

      const errors = results
        .map((result, index) => result.status === 'rejected' ? `Update ${index + 1} failed` : null)
        .filter(Boolean);

      if (errors.length > 0) {
        setError(errors.join(', '));
        return { success: false, error: errors.join(', ') };
      }

      // Refresh user data
      const { session: currentSession } = await authService.getSession();
      if (currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
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
    updateUserProfile,
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
