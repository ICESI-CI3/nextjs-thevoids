'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, LoginCredentials, User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: string[];
  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedPermissions = localStorage.getItem('permissions');

      if (
        storedToken &&
        storedToken !== 'undefined' &&
        storedUser &&
        storedUser !== 'undefined'
      ) {
        setToken(storedToken);
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch {
          // Silently remove corrupted user data
          localStorage.removeItem('user');
        }

        if (storedPermissions && storedPermissions !== 'undefined') {
          try {
            const parsedPermissions = JSON.parse(storedPermissions);
            setPermissions(
              Array.isArray(parsedPermissions) ? parsedPermissions : []
            );
          } catch {
            // Silently remove corrupted permissions data
            localStorage.removeItem('permissions');
            setPermissions([]);
          }
        }
      }
    } catch {
      // Silently handle localStorage errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);

      if (response.error || !response.data) {
        return { success: false, error: response.error || 'Login failed' };
      }

      const {
        user: userData,
        token: userToken,
        permissions: userPermissions,
      } = response.data;

      setUser(userData);
      setToken(userToken);
      setPermissions(userPermissions);

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('permissions', JSON.stringify(userPermissions));

      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPermissions([]);
    authApi.logout();
    router.push('/login');
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
