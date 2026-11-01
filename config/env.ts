/**
 * Application environment configuration for SP Solar Solutions
 * Safely parses and exposes EXPO_PUBLIC_* variables with fallbacks.
 * Enables clear switching between Mock Mode and API Integration Mode.
 */

export interface AppEnv {
  apiBaseUrl: string;
  appEnv: 'development' | 'staging' | 'production';
  apiTimeoutMs: number;
  useMockApi: boolean;
  supportPhone: string;
  supportEmail: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnv = (): AppEnv => {
  // Support both EXPO_PUBLIC_API_BASE_URL and EXPO_PUBLIC_API_URL for backward-compatibility
  const rawApiUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    '';

  const appEnv = (process.env.EXPO_PUBLIC_APP_ENV as AppEnv['appEnv']) || 'development';
  const apiTimeoutMs = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS) || 15000;
  const supportPhone = process.env.EXPO_PUBLIC_SUPPORT_PHONE || '+91 98765 43210';
  const supportEmail =
    process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@spsolar.example.com';

  // Explicit Mock Mode flag: Default to true unless EXPO_PUBLIC_USE_MOCK is explicitly 'false' AND an API URL is supplied
  const explicitMockFlag = process.env.EXPO_PUBLIC_USE_MOCK;
  const useMockApi =
    explicitMockFlag === 'true' ||
    explicitMockFlag === undefined ||
    !rawApiUrl ||
    rawApiUrl.includes('example.com');

  return {
    apiBaseUrl: rawApiUrl.replace(/\/+$/, ''),
    appEnv,
    apiTimeoutMs,
    useMockApi,
    supportPhone,
    supportEmail,
    isDevelopment: appEnv === 'development',
    isProduction: appEnv === 'production',
  };
};

export const env = getEnv();

// Log application mode in development without leaking secrets
if (__DEV__) {
  console.log(
    `[SP Solar] Operating in ${env.useMockApi ? 'MOCK MODE (Local In-Memory Services)' : `API MODE (${env.apiBaseUrl})`}`
  );
}
