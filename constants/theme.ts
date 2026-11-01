import { Platform } from 'react-native';
import { colors } from './colors';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 20,
  '2xl': 24,
  pill: 999,
  // Aliases for convenience
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;

const fontFamilies = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto',
    semiBold: 'Roboto',
    bold: 'Roboto',
  },
  default: {
    regular: 'sans-serif',
    medium: 'sans-serif',
    semiBold: 'sans-serif',
    bold: 'sans-serif',
  },
}) || {
  regular: 'sans-serif',
  medium: 'sans-serif',
  semiBold: 'sans-serif',
  bold: 'sans-serif',
};

export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  fontFamily: string;
  letterSpacing?: number;
}

export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.5,
  },
  headingLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.2,
  },
  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    fontFamily: fontFamilies.semiBold,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    fontFamily: fontFamilies.regular,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    fontFamily: fontFamilies.medium,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    fontFamily: fontFamilies.medium,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    fontFamily: fontFamilies.regular,
  },
  button: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    fontFamily: fontFamilies.semiBold,
    letterSpacing: 0.2,
  },
  navLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
    fontFamily: fontFamilies.medium,
  },
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#001735',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#001735',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#001735',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const layout = {
  screenPadding: spacing.md, // 16
  minTouchTarget: 44, // Minimum accessible touch target
  maxContentWidth: 640,
  headerHeight: 56,
  tabBarHeight: 60,
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  fontSizes,
  fontWeights,
  shadows,
  layout,
} as const;

export type Theme = typeof theme;
export type TypographyVariant = keyof typeof typography;
