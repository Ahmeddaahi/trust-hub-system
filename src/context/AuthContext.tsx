
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  refreshToken: async () => false,
});

// Token refresh timer
let refreshTimerId: number | undefined;

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Set user from Supabase session
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'user',
          };
          
          setUser(userData);
          setAccessToken(session.access_token);
          setRefreshTokenValue(session.refresh_token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'user',
          };
          
          setUser(userData);
          setAccessToken(session.access_token);
          setRefreshTokenValue(session.refresh_token);
        } else {
          setUser(null);
          setAccessToken(null);
          setRefreshTokenValue(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (refreshTimerId) {
        clearInterval(refreshTimerId);
      }
    };
  }, []);

  // Register a new user
  const handleRegister = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user'
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Registration successful",
        description: "Please check your email for verification",
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
      
      if (data.session) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || '',
          role: data.user.user_metadata?.role || 'user',
        };
        
        setUser(userData);
        setAccessToken(data.session.access_token);
        setRefreshTokenValue(data.session.refresh_token);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state
      setUser(null);
      setAccessToken(null);
      setRefreshTokenValue(null);
      
      if (refreshTimerId) {
        clearInterval(refreshTimerId);
      }
      
      setIsLoading(false);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    }
  };

  // Refresh access token
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error('Error refreshing token:', error);
        return false;
      }
      
      setAccessToken(data.session.access_token);
      setRefreshTokenValue(data.session.refresh_token);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken: refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
