// src/theme/ui-theme.js

/**
 * AirGuard AI Design System
 * Central theme configuration for colors, typography, and animation tokens
 * 
 * Usage:
 * import { colors, fonts, animations } from './theme/ui-theme';
 */

export const colors = {
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#0F9D58', // Main brand green
    600: '#0D8A4D',
    700: '#0B7742',
    800: '#096437',
    900: '#074E2C',
  },
  accent: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#4285F4', // Gemini blue
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  success: {
    light: '#81C784',
    DEFAULT: '#4CAF50',
    dark: '#388E3C',
  },
  danger: {
    light: '#EF5350',
    DEFAULT: '#F44336',
    dark: '#C62828',
  },
  warning: {
    light: '#FFB74D',
    DEFAULT: '#FF9800',
    dark: '#F57C00',
  },
  muted: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  highlight: {
    gradient: 'linear-gradient(135deg, #0F9D58 0%, #4285F4 100%)',
    glow: 'rgba(15, 157, 88, 0.3)',
  },
};

export const fonts = {
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  families: {
    display: "'Outfit', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
};

export const animations = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '800ms',
  },
  easings: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

export const spacing = {
  cardPadding: '1.5rem',
  sectionGap: '2rem',
  componentGap: '1rem',
};

export default { colors, fonts, animations, spacing };
