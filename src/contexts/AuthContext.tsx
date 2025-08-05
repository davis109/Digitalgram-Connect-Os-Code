import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  language: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string, language: string) => Promise<void>;
  login: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, language: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Register user
  const register = async (name: string, email: string, password: string, language: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/users/register', {
        name,
        email,
        password,
        language
      });

      const userData = response.data.user;
      setUser(userData);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  // Login user
  const login = async (email: string, password: string, role?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/users/login', {
        email,
        password,
        role // Pass the role to the backend
      });

      const userData = response.data.user;
      setUser(userData);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update profile
  const updateProfile = async (name: string, language: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put('/api/users/profile', {
        name,
        language
      });

      // Update user with new data but keep the token
      const updatedUser = { ...user, name, language } as User;
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};