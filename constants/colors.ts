/**
 * Centralized color palette for SP Solar Solutions Customer Mobile Application
 * Official Brand System: Deep Navy, Metallic Gold, and Clean Light Surfaces.
 */

export const colors = {
  // Brand Core Colors
  navy: {
    50: '#E8EEF5',
    100: '#C5D4E6',
    200: '#9FB7D4',
    300: '#7599C1',
    400: '#4F7FAF',
    500: '#2A66A0',
    600: '#144D87',
    700: '#0A3769',
    800: '#001735', // Primary Navy
    900: '#001126', // Deep Navy
  },
  gold: {
    50: '#FDFBF4',
    100: '#FAF4E3',
    200: '#F5E6BF',
    300: '#F2C66D', // Light Gold
    400: '#E6B859',
    500: '#DDA746', // Primary Gold
    600: '#C79035',
    700: '#A97526',
    800: '#8A5D1C',
    900: '#684311',
  },

  // Base Colors
  white: '#FFFFFF',
  black: '#000000',

  // Brand Aliases
  primary: {
    navy: '#001735',
    deepNavy: '#001126',
    gold: '#DDA746',
    lightGold: '#F2C66D',
  },

  // Surfaces & Backgrounds
  background: '#F7F8FA', // Off White content background
  surface: '#FFFFFF', // Clean white cards & sheets
  surfaceSubtle: '#F2F4F7',
  surfaceDisabled: '#EAECF0',
  surfaceNavy: '#001735',
  surfaceDeepNavy: '#001126',

  // Text Hierarchy
  text: {
    primary: '#172033', // Primary dark text
    secondary: '#667085', // Secondary subtle text
    muted: '#98A2B3', // Muted/placeholder text
    inverse: '#FFFFFF', // White text on dark navy
    gold: '#DDA746', // Accent gold text
    navy: '#001735', // Brand navy text
  },

  // Borders & Dividers
  border: {
    light: '#E4E7EC', // Light border alias
    subtle: '#F2F4F7',
    default: '#E4E7EC', // Standard border
    strong: '#D0D5DD',
    focus: '#DDA746', // Gold focus ring
    focusNavy: '#001735',
    error: '#DC2626',
  },

  // Ticket Status Colors (Semantic with brand alignment)
  status: {
    raised: {
      bg: '#F2F4F7',
      text: '#344054',
      border: '#D0D5DD',
      dot: '#667085',
    },
    assigned: {
      bg: '#EFF8FF',
      text: '#175CD3',
      border: '#B2DDFF',
      dot: '#2563EB',
    },
    inProgress: {
      bg: '#FEFDF0',
      text: '#B54708',
      border: '#F9DBAF',
      dot: '#DDA746',
    },
    resolved: {
      bg: '#ECFDF3',
      text: '#027A48',
      border: '#A6F4C5',
      dot: '#16A34A',
    },
    closed: {
      bg: '#F8F9FA',
      text: '#1D2939',
      border: '#D0D5DD',
      dot: '#475467',
    },
  },

  // Semantic Feedback Colors
  feedback: {
    success: '#16A34A',
    successBg: '#ECFDF3',
    successBorder: '#A6F4C5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',
    error: '#DC2626',
    errorBg: '#FEF2F2',
    errorBorder: '#FECDCA',
    info: '#2563EB',
    infoBg: '#EFF8FF',
    infoBorder: '#B2DDFF',
  },

  // Modal / Sheet Overlay
  overlay: 'rgba(0, 17, 38, 0.6)',
} as const;

export type ColorTokens = typeof colors;
