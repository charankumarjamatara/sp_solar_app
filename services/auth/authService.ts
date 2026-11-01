import { apiClient } from '../api/client';
import { secureStorage } from '../storage/secureStorage';
import { APP_CONFIG } from '../../config';
import { AuthSession, Customer, LoginCredentials } from '../../types';

class AuthService {
  /**
   * Request OTP for a phone number
   */
  async requestOtp(phoneNumber: string): Promise<void> {
    // Mock OTP request
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`[Mock] OTP requested for ${phoneNumber}`);
    // In a real app, this would call apiClient.post('/auth/otp/request', { phoneNumber })
  }

  /**
   * Authenticate customer with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    // Mock login since backend API is not yet implemented
    // Accept any identifier/password or OTP for testing purposes
    const session: AuthSession = {
      accessToken: 'mock-jwt-token-12345',
      refreshToken: 'mock-refresh-token-67890',
      expiresIn: 3600,
      customer: {
        id: 'cus_mock_999',
        name: 'Solar Customer',
        email: credentials.identifier.includes('@') ? credentials.identifier : 'customer@spsolar.com',
        phoneNumber: !credentials.identifier.includes('@') ? credentials.identifier : '+1 555 019 9999',
        address: {
          street: '123 Sunbeam Ave',
          city: 'Solarville',
          state: 'CA',
          postalCode: '90210',
          country: 'USA'
        },
        createdAt: new Date().toISOString(),
      }
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (session.accessToken) {
      await secureStorage.setItem(APP_CONFIG.storageKeys.authToken, session.accessToken);
    }
    if (session.refreshToken) {
      await secureStorage.setItem(
        APP_CONFIG.storageKeys.refreshToken,
        session.refreshToken
      );
    }
    if (session.customer) {
      await secureStorage.setItem(
        APP_CONFIG.storageKeys.userSession,
        JSON.stringify(session.customer)
      );
    }

    return session;
  }

  /**
   * Retrieve current authenticated customer profile
   */
  async getCurrentCustomer(): Promise<Customer> {
    const cached = await this.getCachedCustomer();
    if (cached) return cached;
    // Fallback default
    return {
      id: 'cus_mock_999',
      name: 'Sunita Sharma',
      email: 'sunita.sharma@example.com',
      phoneNumber: '+91 98765 43210',
      address: {
        street: 'Flat 402, Green Meadows',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560102',
        country: 'India',
      },
      createdAt: '2026-01-15T10:00:00.000Z',
    };
  }

  /**
   * Update customer profile information
   */
  async updateProfile(updates: Partial<Customer>): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const current = await this.getCurrentCustomer();
    const updatedCustomer: Customer = {
      ...current,
      ...updates,
      address: {
        ...current.address,
        ...(updates.address || {}),
      },
    };

    await secureStorage.setItem(
      APP_CONFIG.storageKeys.userSession,
      JSON.stringify(updatedCustomer)
    );

    return updatedCustomer;
  }

  /**
   * Refresh the access token using stored refresh token
   */
  async refreshSession(): Promise<AuthSession> {
    const refreshToken = await secureStorage.getItem(APP_CONFIG.storageKeys.refreshToken);
    const response = await apiClient.post<AuthSession>(
      '/auth/refresh',
      { refreshToken },
      { requiresAuth: false }
    );
    if (response.data.accessToken) {
      await secureStorage.setItem(
        APP_CONFIG.storageKeys.authToken,
        response.data.accessToken
      );
    }
    return response.data;
  }

  /**
   * Log out customer and clear stored session tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue clearing local storage even if API call fails
    } finally {
      await secureStorage.clearAll([
        APP_CONFIG.storageKeys.authToken,
        APP_CONFIG.storageKeys.refreshToken,
        APP_CONFIG.storageKeys.userSession,
      ]);
    }
  }

  /**
   * Check if customer has a valid stored token
   */
  async getStoredToken(): Promise<string | null> {
    return secureStorage.getItem(APP_CONFIG.storageKeys.authToken);
  }

  /**
   * Get cached customer data from secure store
   */
  async getCachedCustomer(): Promise<Customer | null> {
    const data = await secureStorage.getItem(APP_CONFIG.storageKeys.userSession);
    if (!data) return null;
    try {
      return JSON.parse(data) as Customer;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
