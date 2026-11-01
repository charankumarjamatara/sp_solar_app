export * from './env';

export const APP_CONFIG = {
  name: 'SP Solar Solutions',
  shortName: 'SP Solar',
  tagline: 'Customer Solar Care & Support',
  version: '1.0.0',
  establishedYear: 2026,
  storageKeys: {
    authToken: 'sp_solar_auth_token',
    refreshToken: 'sp_solar_refresh_token',
    userSession: 'sp_solar_user_session',
    themePreference: 'sp_solar_theme_preference',
  },
  uploadLimits: {
    maxImagesPerTicket: 5,
    maxFileSizeMb: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  pagination: {
    defaultPageSize: 15,
  },
  rating: {
    minStars: 1,
    maxStars: 5,
  },
} as const;
