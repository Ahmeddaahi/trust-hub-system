
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

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
        const storedUser = localStorage.getItem('user');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        if (storedUser && storedRefreshToken) {
          setUser(JSON.parse(storedUser));
          setRefreshTokenValue(storedRefreshToken);
          
          // Try to get a new access token
          const success = await refreshAccessToken(storedRefreshToken);
          if (!success) {
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (refreshTimerId) {
        clearInterval(refreshTimerId);
      }
    };
  }, []);

  // Setup token refresh interval when we have a refresh token
  useEffect(() => {
    if (refreshTokenValue && accessToken) {
      setupRefreshInterval();
    }
    return () => {
      if (refreshTimerId) {
        clearInterval(refreshTimerId);
      }
    };
  }, [refreshTokenValue, accessToken]);

  // Setup refresh interval (every 14 minutes to refresh 15-minute tokens)
  const setupRefreshInterval = () => {
    if (refreshTimerId) {
      clearInterval(refreshTimerId);
    }

    // Refresh token every 14 minutes (before the 15-minute expiry)
    refreshTimerId = window.setInterval(async () => {
      if (refreshTokenValue) {
        await refreshAccessToken(refreshTokenValue);
      }
    }, 14 * 60 * 1000);
  };

  // Refresh access token
  const refreshAccessToken = async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  // Register a new user
  const handleRegister = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        toast({
          title: "Registration successful",
          description: "Please log in with your new account",
        });
        return true;
      } else {
        toast({
          title: "Registration failed",
          description: data.message || "Please try again",
          variant: "destructive",
        });
        return false;
      }
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user && data.accessToken && data.refreshToken) {
        setUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshTokenValue(data.refreshToken);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('refreshToken', data.refreshToken);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
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
      if (refreshTokenValue) {
        // Call logout API
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage
      setUser(null);
      setAccessToken(null);
      setRefreshTokenValue(null);
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
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

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken: () => refreshTokenValue ? refreshAccessToken(refreshTokenValue) : Promise.resolve(false),
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
