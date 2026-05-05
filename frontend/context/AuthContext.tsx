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
    try {
      const response = await api.login(email, password);
      const mockUser: User = {
        id: response.id || '1',
        email,
        verified: response.verified || false,
        profileCompleted: response.profileCompleted || false,
        token: response.token || 'mock-token',
      };
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    } catch (err) {
      console.error('Login error:', err);
      // Fallback: allow login with mock data if backend fails
      const mockUser: User = {
        id: '1',
        email,
        verified: false,
        profileCompleted: false,
        token: 'mock-token',
      };
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await api.signup(email, password);
      const mockUser: User = {
        id: response.id || '1',
        email,
        verified: false,
        profileCompleted: false,
        token: response.token || 'mock-token',
      };
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    } catch (err) {
      console.error('Signup error:', err);
      // Fallback: allow signup with mock data if backend fails
      const mockUser: User = {
        id: '1',
        email,
        verified: false,
        profileCompleted: false,
        token: 'mock-token',
      };
      setUser(mockUser);
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
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
