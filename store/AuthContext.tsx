import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Customer, LoginCredentials } from '../types';
import { authService } from '../services/auth/authService';

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateCustomerProfile: (updates: Partial<Customer>) => Promise<Customer>;
  refreshProfile: () => Promise<void>;
  requestOtp: (phoneNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and restore session from secure store
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const storedToken = await authService.getStoredToken();
        const cachedCustomer = await authService.getCachedCustomer();

        if (isMounted) {
          if (storedToken && cachedCustomer) {
            setToken(storedToken);
            setCustomer(cachedCustomer);
          }
        }
      } catch (error) {
        console.warn('[AuthProvider] Failed to restore auth session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const session = await authService.login(credentials);
      setToken(session.accessToken);
      setCustomer(session.customer);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setCustomer(null);
      setIsLoading(false);
    }
  };

  const updateCustomerProfile = async (updates: Partial<Customer>): Promise<Customer> => {
    setIsLoading(true);
    try {
      const updated = await authService.updateProfile(updates);
      setCustomer(updated);
      return updated;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const profile = await authService.getCurrentCustomer();
      setCustomer(profile);
    } catch (error) {
      console.warn('[AuthProvider] Failed to refresh profile:', error);
    }
  };

  const requestOtp = async (phoneNumber: string): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.requestOtp(phoneNumber);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      customer,
      token,
      isAuthenticated: Boolean(token && customer),
      isLoading,
      login,
      logout,
      updateCustomerProfile,
      refreshProfile,
      requestOtp,
    }),
    [customer, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
