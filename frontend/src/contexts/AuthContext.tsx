import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  devLogin: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - Azure VM Configuration
// VM IP: 4.240.103.28
// Backend Port: 3001
// Note: This is hardcoded to avoid Vite environment variable build-time issues
const API_BASE_URL = 'http://4.240.103.28:3001/api/v1';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trellin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('trellin_token');
      const storedUser = localStorage.getItem('trellin_user');

      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await api.get('/auth/verify');
          if (response.data.success) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('trellin_token');
            localStorage.removeItem('trellin_user');
          }
        } catch (error) {
          // Token verification failed, clear storage
          localStorage.removeItem('trellin_token');
          localStorage.removeItem('trellin_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { username: email, password });
      
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('trellin_token', userToken);
        localStorage.setItem('trellin_user', JSON.stringify(userData));
        
        setToken(userToken);
        setUser(userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const devLogin = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/dev-login');
      
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        
        // Store token and user data
        localStorage.setItem('trellin_token', userToken);
        localStorage.setItem('trellin_user', JSON.stringify(userData));
        
        setToken(userToken);
        setUser(userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Development login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('trellin_token');
    localStorage.removeItem('trellin_user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    devLogin,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { api };
