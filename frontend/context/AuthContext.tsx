import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  verified: boolean;
  profileCompleted: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateVerification: (verified: boolean) => Promise<void>;
  updateProfile: (profileCompleted: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error('Failed to restore user', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    
    // Check if login failed
    if (response.error) {
      throw new Error(response.error);
    }
    
    // Only proceed if we have a valid response
    if (!response.id) {
      throw new Error('Invalid credentials');
    }
    
    const userData: User = {
      id: response.id,
      email,
      verified: response.verified || false,
      profileCompleted: response.profileCompleted || false,
      token: response.token || 'mock-token',
    };
    
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const signup = async (email: string, password: string) => {
    const response = await api.signup(email, password);
    
    // Check if signup failed
    if (response.error) {
      throw new Error(response.error);
    }
    
    // Only proceed if we have a valid response
    if (!response.id) {
      throw new Error('Signup failed');
    }
    
    const userData: User = {
      id: response.id,
      email,
      verified: false,
      profileCompleted: false,
      token: response.token || 'mock-token',
    };
    
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.clear(); // Clear all storage
    console.log('✓ Logged out and cleared storage');
  };

  const updateVerification = async (verified: boolean) => {
    if (user) {
      const updated = { ...user, verified };
      setUser(updated);
      await AsyncStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const updateProfile = async (profileCompleted: boolean) => {
    if (user) {
      const updated = { ...user, profileCompleted };
      setUser(updated);
      await AsyncStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateVerification,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
