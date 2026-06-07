export const colors = {
  brand: {
    primary: '#F97316',
    secondary: '#22D3EE',
  },
  surface: {
    bg: '#09090B',
    card: '#18181B',
    elevated: '#27272A',
    border: '#3F3F46',
  },
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    disabled: '#52525B',
  },
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  full: 9999,
} as const;
