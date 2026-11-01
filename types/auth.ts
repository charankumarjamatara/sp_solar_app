import { Customer } from './customer';

/**
 * Authentication and Session Types
 */

export interface LoginCredentials {
  identifier: string; // Phone number or email
  password?: string;
  otp?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  customer: Customer;
}

export interface AuthState {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
