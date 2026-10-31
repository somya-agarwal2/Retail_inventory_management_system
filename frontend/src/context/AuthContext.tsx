import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  switchDemoRole: (username: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rims_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rims_jwt_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('rims_jwt_token');
      if (savedToken) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
          localStorage.setItem('rims_user', JSON.stringify(profile));
        } catch (err) {
          console.error('Session expired or invalid token', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authApi.login(credentials);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('rims_jwt_token', response.token);
      localStorage.setItem('rims_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (username: string) => {
    await login({ username, password: 'Password@123' });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rims_jwt_token');
    localStorage.removeItem('rims_user');
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    const cleanUserRole = user.role.replace(/^ROLE_/, '').toUpperCase();
    const cleanTargetRole = role.replace(/^ROLE_/, '').toUpperCase();
    return cleanUserRole === cleanTargetRole;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        switchDemoRole,
        logout,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
