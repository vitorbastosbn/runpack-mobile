export const colors = {
  brand: {
    primary: '#FF5A1F',
  },
  surface: {
    bg: '#0A0A0C',
    card: '#141417',
    elevated: '#1E1E23',
    border: '#26262C',
  },
  text: {
    primary: '#F7F7F8',
    secondary: '#9C9CA6',
    disabled: '#5B5B66',
  },
  status: {
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F0413E',
    info: '#60A5FA',
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
  sm: 8,
  md: 14,
  lg: 20,
  full: 9999,
} as const;

/** Números grandes (tempo, distância, pace) — identidade visual do app. */
export const numeric = {
  fontWeight: '800' as const,
  fontVariant: ['tabular-nums'] as const,
};
