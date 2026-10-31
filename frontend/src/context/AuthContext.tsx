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

const DEMO_USERS: Record<string, User> = {
  admin: { id: 1, username: 'admin', email: 'admin@xyzretail.com', firstName: 'Alexander', lastName: 'Pierce', role: 'ROLE_ADMIN', status: 'ACTIVE' },
  wh_manager: { id: 2, username: 'wh_manager', email: 'marcus.vance@xyzretail.com', firstName: 'Marcus', lastName: 'Vance', role: 'ROLE_WAREHOUSE_MANAGER', status: 'ACTIVE', assignedLocationType: 'WAREHOUSE', assignedLocationId: 1, assignedLocationName: 'Central Distribution Hub' },
  store_mgr: { id: 3, username: 'store_mgr', email: 'elena.rodriguez@xyzretail.com', firstName: 'Elena', lastName: 'Rodriguez', role: 'ROLE_STORE_MANAGER', status: 'ACTIVE', assignedLocationType: 'STORE', assignedLocationId: 1, assignedLocationName: 'Fifth Ave Flagship Store' },
  proc_mgr: { id: 4, username: 'proc_mgr', email: 'david.chen@xyzretail.com', firstName: 'David', lastName: 'Chen', role: 'ROLE_PROCUREMENT_MANAGER', status: 'ACTIVE' },
  inv_auditor: { id: 5, username: 'inv_auditor', email: 'sarah.jenkins@xyzretail.com', firstName: 'Sarah', lastName: 'Jenkins', role: 'ROLE_INVENTORY_AUDITOR', status: 'ACTIVE' },
  logistics: { id: 6, username: 'logistics', email: 'rachel.patel@xyzretail.com', firstName: 'Rachel', lastName: 'Patel', role: 'ROLE_LOGISTICS_OFFICER', status: 'ACTIVE' },
  cashier: { id: 7, username: 'cashier', email: 'carlos.mendez@xyzretail.com', firstName: 'Carlos', lastName: 'Mendez', role: 'ROLE_CASHIER', status: 'ACTIVE' },
  analyst: { id: 8, username: 'analyst', email: 'sophia.taylor@xyzretail.com', firstName: 'Sophia', lastName: 'Taylor', role: 'ROLE_BUSINESS_ANALYST', status: 'ACTIVE' },
};

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
        if (savedToken.startsWith('demo-jwt-token-')) {
          setIsLoading(false);
          return;
        }
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
    } catch (err: any) {
      const demo = DEMO_USERS[credentials.username.toLowerCase()];
      if (demo && credentials.password === 'Password@123') {
        const dummyToken = 'demo-jwt-token-' + credentials.username;
        setToken(dummyToken);
        setUser(demo);
        localStorage.setItem('rims_jwt_token', dummyToken);
        localStorage.setItem('rims_user', JSON.stringify(demo));
      } else {
        throw err;
      }
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
