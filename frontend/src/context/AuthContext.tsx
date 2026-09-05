import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest, UserView } from '../types';

interface AuthContextType {
  user: UserView | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('moodify_token'));
  const [user, setUser] = useState<UserView | null>(() => {
    const saved = localStorage.getItem('moodify_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('moodify_token');
    localStorage.removeItem('moodify_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('moodify_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      localStorage.setItem('moodify_user', JSON.stringify(freshUser));
    } catch {
      // If token is invalid or expired
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('moodify_auth_changed', handleAuthChange);
    return () => window.removeEventListener('moodify_auth_changed', handleAuthChange);
  }, [refreshUser]);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      localStorage.setItem('moodify_token', response.token);
      localStorage.setItem('moodify_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      localStorage.setItem('moodify_token', response.token);
      localStorage.setItem('moodify_user', JSON.stringify(response.user));
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
